const Subscription = require('../models/subscriptionModel');
const Organization = require('../models/organizationModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

// Price IDs - configure these in your Stripe dashboard
const PRICE_IDS = {
  professional_monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || 'price_professional_monthly',
  professional_annual: process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL || 'price_professional_annual',
  enterprise_monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
  enterprise_annual: process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL || 'price_enterprise_annual',
};

// @desc    Get current user's subscription
// @route   GET /api/subscriptions/me
const getMySubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findOne({ user: req.user._id || req.user.id });

    if (!subscription) {
      // Create a default starter subscription
      subscription = await Subscription.create({
        user: req.user._id || req.user.id,
        plan: 'starter',
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    }

    const limits = Subscription.PLAN_LIMITS[subscription.plan];

    res.json({
      success: true,
      data: {
        subscription,
        limits,
        usage: subscription.usage,
      },
    });
  } catch (error) {
    logger.error(`Get subscription error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to get subscription' });
  }
};

// @desc    Get available plans
// @route   GET /api/subscriptions/plans
const getPlans = async (req, res) => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'For individuals getting started with insurance appeals',
      monthlyPrice: 0,
      annualPrice: 0,
      limits: Subscription.PLAN_LIMITS.starter,
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'For practices and billing departments',
      monthlyPrice: 4900, // in cents
      annualPrice: 46800, // $39/month * 12
      limits: Subscription.PLAN_LIMITS.professional,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For hospitals and large organizations',
      monthlyPrice: 19900,
      annualPrice: 190800, // $159/month * 12
      limits: Subscription.PLAN_LIMITS.enterprise,
    },
  ];

  res.json({ success: true, data: plans });
};

// @desc    Create checkout session for subscription
// @route   POST /api/subscriptions/checkout
const createCheckout = async (req, res) => {
  try {
    const { plan, interval } = req.body;

    if (plan === 'starter') {
      return res.status(400).json({ success: false, message: 'Starter plan is free, no checkout required' });
    }

    if (!['professional', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan selected' });
    }

    const priceKey = `${plan}_${interval || 'monthly'}`;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      return res.status(400).json({ success: false, message: 'Invalid plan/interval combination' });
    }

    // In production, create a Stripe checkout session
    // For now, return a mock checkout URL
    if (process.env.STRIPE_SECRET_KEY && process.env.USE_MOCK_DB !== 'true') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

      let subscription = await Subscription.findOne({ user: req.user._id || req.user.id });
      let customerId = subscription?.stripeCustomerId;

      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.user.email,
          metadata: { userId: (req.user._id || req.user.id).toString() },
        });
        customerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing?success=true`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pricing?canceled=true`,
        subscription_data: {
          trial_period_days: 14,
          metadata: { userId: (req.user._id || req.user.id).toString(), plan },
        },
      });

      return res.json({ success: true, data: { checkoutUrl: session.url, sessionId: session.id } });
    }

    // Mock mode - simulate subscription creation
    let subscription = await Subscription.findOne({ user: req.user._id || req.user.id });

    if (subscription) {
      subscription.plan = plan;
      subscription.status = 'trialing';
      subscription.billingInterval = interval || 'monthly';
      subscription.trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      subscription.currentPeriodStart = new Date();
      subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await subscription.save();
    } else {
      subscription = await Subscription.create({
        user: req.user._id || req.user.id,
        plan,
        status: 'trialing',
        billingInterval: interval || 'monthly',
        trialEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    res.json({
      success: true,
      data: {
        subscription,
        message: 'Trial activated! Your 14-day free trial has started.',
      },
    });
  } catch (error) {
    logger.error(`Checkout error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to create checkout session' });
  }
};

// @desc    Handle Stripe webhook
// @route   POST /api/subscriptions/webhook
const handleWebhook = async (req, res) => {
  if (process.env.USE_MOCK_DB === 'true') {
    return res.json({ received: true });
  }

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.subscription_data?.metadata?.userId;
        if (userId) {
          await Subscription.findOneAndUpdate(
            { user: userId },
            {
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              status: 'active',
            },
            { upsert: true }
          );
        }
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        const sub = await Subscription.findOne({ stripeCustomerId: invoice.customer });
        if (sub) {
          sub.status = 'active';
          sub.invoices.push({
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid,
            status: 'paid',
            paidAt: new Date(),
            invoiceUrl: invoice.hosted_invoice_url,
          });
          await sub.save();
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { status: 'past_due' }
        );
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await Subscription.findOneAndUpdate(
          { stripeSubscriptionId: subscription.id },
          { status: 'canceled', plan: 'starter' }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook error: ${error.message}`);
    res.status(400).json({ success: false, message: 'Webhook error' });
  }
};

// @desc    Cancel subscription
// @route   POST /api/subscriptions/cancel
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id || req.user.id });

    if (!subscription || subscription.plan === 'starter') {
      return res.status(400).json({ success: false, message: 'No active paid subscription to cancel' });
    }

    if (process.env.STRIPE_SECRET_KEY && subscription.stripeSubscriptionId && process.env.USE_MOCK_DB !== 'true') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      success: true,
      data: { message: 'Subscription will be canceled at the end of the current billing period', subscription },
    });
  } catch (error) {
    logger.error(`Cancel subscription error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to cancel subscription' });
  }
};

// @desc    Get usage stats
// @route   GET /api/subscriptions/usage
const getUsage = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id || req.user.id });

    if (!subscription) {
      return res.json({
        success: true,
        data: {
          plan: 'starter',
          usage: { appealsThisMonth: 0, documentsThisMonth: 0, aiGenerationsThisMonth: 0 },
          limits: Subscription.PLAN_LIMITS.starter,
        },
      });
    }

    res.json({
      success: true,
      data: {
        plan: subscription.plan,
        usage: subscription.usage,
        limits: Subscription.PLAN_LIMITS[subscription.plan],
      },
    });
  } catch (error) {
    logger.error(`Get usage error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Failed to get usage data' });
  }
};

module.exports = {
  getMySubscription,
  getPlans,
  createCheckout,
  handleWebhook,
  cancelSubscription,
  getUsage,
};
