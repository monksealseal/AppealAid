const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Integrates with Claude and other AI services to generate appeals and analyze documents
 */
class AIService {
  /**
   * Generate an appeal letter using Claude API
   * 
   * @param {Object} data - Document and appeal information
   * @param {String} apiKey - Claude API key
   * @returns {Object} Generated appeal letter and analysis
   */
  async generateAppealWithClaude(data, apiKey) {
    try {
      logger.info('Generating appeal with Claude API');
      
      if (!apiKey) {
        throw new Error('Claude API key is required');
      }
      
      // Extract relevant information from data
      const { 
        denialReason, 
        serviceDescription, 
        diagnosisCodes,
        procedureCodes,
        claimNumber,
        serviceDate,
        patientInfo,
        insuranceCarrier,
        additionalContext
      } = data;
      
      // Create system prompt
      const systemPrompt = `You are an expert in medical insurance appeals with extensive knowledge of healthcare regulations, 
insurance policies, and medical billing. Your task is to write a persuasive appeal letter challenging a denied health insurance claim.
You should use a professional, authoritative tone while creating a compelling case for why the claim should be covered.`;
      
      // Create human prompt
      const humanPrompt = `I need to appeal a denied health insurance claim with the following details:

Denial Reason: ${denialReason || "Not provided"}
Procedure/Service: ${serviceDescription || "Not provided"}
Diagnosis Codes: ${diagnosisCodes ? diagnosisCodes.join(', ') : "Not provided"}
Procedure Codes: ${procedureCodes ? procedureCodes.join(', ') : "Not provided"}
Claim Number: ${claimNumber || "Not provided"}
Service Date: ${serviceDate || "Not provided"}
Insurance Carrier: ${insuranceCarrier || "Not provided"}

${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Please write a comprehensive, persuasive appeal letter that:
1. Opens with proper formatting and header information
2. Clearly states the purpose of the letter
3. Provides specific reasons why the denial should be overturned
4. References relevant insurance policy provisions or healthcare regulations
5. Explains the medical necessity of the service/procedure
6. Requests a specific action (approval of the claim)
7. Includes appropriate closing

Also include a brief analysis of:
- The strengths and weaknesses of this appeal case
- Key arguments most likely to succeed
- Suggested supporting documentation to include
- Estimated probability of success`;

      // Call Claude API
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: humanPrompt
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          }
        }
      );
      
      // Process Claude's response
      const assistantMessage = response.data.content[0].text;
      
      // Parse the response to separate the letter from the analysis
      // Typically Claude will provide the letter followed by the analysis
      const responseParts = this.parseClaudeResponse(assistantMessage);
      
      return {
        appealContent: responseParts.letter,
        aiAnalysis: responseParts.analysis,
        aiConfidence: responseParts.confidence,
        model: 'claude-3-sonnet',
        success: true
      };
      
    } catch (error) {
      logger.error('Error generating appeal with Claude:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate appeal with Claude',
        errorDetails: error.response?.data || error
      };
    }
  }
  
  /**
   * Generate an appeal letter using the default system AI
   * 
   * @param {Object} data - Document and appeal information
   * @returns {Object} Generated appeal letter and analysis
   */
  async generateAppealWithDefaultAI(data) {
    try {
      logger.info('Generating appeal with default system AI');
      
      // Extract relevant information
      const { 
        denialReason, 
        serviceDescription, 
        diagnosisCodes,
        procedureCodes,
        claimNumber,
        serviceDate,
        patientInfo,
        insuranceCarrier,
      } = data;
      
      // In a production system, this would call your default AI service
      // For now, we'll simulate a response with template-based generation
      
      // Generate a basic appeal letter
      const letterTemplate = `[Patient Name]
[Patient Address]
[City, State ZIP]

${new Date().toLocaleDateString()}

[Insurance Company]
Attn: Appeals Department
[Insurance Address]
[City, State ZIP]

Re: Appeal of Claim Denial
Member Name: [Patient Name]
Member ID: ${patientInfo?.insuranceId || "[Insurance ID]"}
Claim Number: ${claimNumber || "[Claim Number]"}
Date of Service: ${serviceDate || "[Service Date]"}

To Whom It May Concern:

I am writing to appeal the denial of coverage for ${serviceDescription || "the medical service"} that was performed on ${serviceDate || "[Service Date]"}. Your company has denied this claim stating that it was "${denialReason || "not covered"}".

I believe this denial is incorrect for the following reasons:

1. My healthcare provider determined that this ${serviceDescription || "procedure"} was medically necessary based on my specific health condition and medical history.
2. The treatment aligns with standard medical practice for my diagnosis${diagnosisCodes ? ` of ${diagnosisCodes.join(', ')}` : ''}.
3. The denial reason contradicts my provider's clinical assessment of my specific situation.

Enclosed please find the following supporting documentation:
- Letter from my physician explaining medical necessity
- Medical records documenting my condition
- Clinical guidelines supporting necessity

Please reconsider this claim and provide the coverage to which I am entitled under my policy. If you require additional information, please contact me at [phone number] or [email].

Thank you for your prompt attention to this matter.

Sincerely,

[Patient Name]`;

      // Simulate a basic analysis
      const analysis = {
        keyArguments: [
          "Focus on medical necessity documentation",
          "Reference specific policy provisions",
          "Include detailed physician statements"
        ],
        suggestedEvidence: [
          "Physician letter explaining necessity",
          "Medical records documenting condition",
          "Clinical guidelines supporting necessity"
        ],
        successProbability: 0.75
      };
      
      return {
        appealContent: letterTemplate,
        aiAnalysis: analysis,
        aiConfidence: 0.85,
        model: 'default',
        success: true
      };
      
    } catch (error) {
      logger.error('Error generating appeal with default AI:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate appeal'
      };
    }
  }
  
  /**
   * Parse Claude's response to separate letter from analysis
   * 
   * @param {String} response - Claude's response text
   * @returns {Object} Parsed letter and analysis
   */
  parseClaudeResponse(response) {
    // Check for sections in Claude's response
    // This is a simple parser and might need improvement based on actual responses
    let letter = '';
    let analysis = '';
    let confidence = 0.75; // Default confidence
    
    if (response.includes('Analysis:') || response.includes('ANALYSIS:')) {
      // Split by Analysis section
      const parts = response.split(/Analysis:|ANALYSIS:/);
      letter = parts[0].trim();
      if (parts.length > 1) {
        analysis = parts[1].trim();
      }
      
      // Try to extract confidence level if mentioned
      const confidenceMatch = analysis.match(/confidence|probability|likelihood|success rate:?\s*(\d+)%/i);
      if (confidenceMatch && confidenceMatch[1]) {
        confidence = parseInt(confidenceMatch[1]) / 100;
      }
    } else {
      // If there's no clear division, assume the whole thing is the letter
      letter = response;
    }
    
    return {
      letter,
      analysis: {
        keyArguments: this.extractKeyPoints(analysis, 'arguments', 'strengths'),
        suggestedEvidence: this.extractKeyPoints(analysis, 'documentation', 'evidence', 'documents'),
        successProbability: confidence
      },
      confidence
    };
  }
  
  /**
   * Extract key points from analysis text
   * 
   * @param {String} analysisText - The analysis text
   * @param {...String} keywords - Keywords to look for in extracting points
   * @returns {Array} Extracted points
   */
  extractKeyPoints(analysisText, ...keywords) {
    if (!analysisText) return [];
    
    // Look for bullet points or numbered lists following keywords
    const points = [];
    
    // Try to find sections with these keywords
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[:\\s]+((?:\\s*[-•*]\\s*[^\\n]+\\n*)+)`, 'i');
      const match = analysisText.match(regex);
      
      if (match && match[1]) {
        // Extract individual bullet points
        const bulletPoints = match[1].match(/[-•*]\s*([^\n]+)/g);
        if (bulletPoints) {
          bulletPoints.forEach(point => {
            const cleanPoint = point.replace(/[-•*]\s*/, '').trim();
            if (cleanPoint && !points.includes(cleanPoint)) {
              points.push(cleanPoint);
            }
          });
        }
      }
    }
    
    // If no bullet points found, try to find any sentences that might contain key points
    if (points.length === 0) {
      // Split by periods and filter for sentences containing keywords
      const sentences = analysisText.split(/\.\s+/);
      for (const keyword of keywords) {
        const relevantSentences = sentences.filter(s => 
          s.toLowerCase().includes(keyword.toLowerCase()) && 
          s.length > 15 && 
          !points.includes(s)
        );
        
        points.push(...relevantSentences.map(s => s.trim() + '.'));
      }
    }
    
    // If still empty, take at most 3 sentences from the analysis
    if (points.length === 0) {
      const sentences = analysisText.split(/\.\s+/).filter(s => s.length > 20);
      points.push(...sentences.slice(0, 3).map(s => s.trim() + '.'));
    }
    
    // Return unique points, max 5
    return [...new Set(points)].slice(0, 5);
  }
  
  /**
   * Analyze a denial based on document data
   * 
   * @param {Object} documentData - Document and denial information
   * @returns {Object} Denial analysis
   */
  async analyzeDenial(documentData) {
    try {
      logger.info('Analyzing denial reason');
      
      // Extract relevant information
      const { denialReason, documentType } = documentData;
      
      // In a production system, this would use an AI to analyze the denial
      // For now, return mock analysis based on denial reason
      
      // Base analysis structure
      const baseAnalysis = {
        overallAssessment: {
          appealProbability: 0.65,
          keyIssue: "Medical necessity not sufficiently established",
          recommendedApproach: "Gather clinical evidence showing why the procedure meets medical necessity requirements",
        },
        commonDenialReasons: [
          {
            reason: "Medical necessity not established",
            frequency: "68% of similar cases",
            suggestions: [
              "Obtain detailed letter from physician explaining necessity",
              "Include relevant clinical guidelines supporting necessity",
              "Document failed attempts at more conservative treatments"
            ]
          },
          {
            reason: "Insufficient documentation",
            frequency: "42% of similar cases",
            suggestions: [
              "Include complete medical records",
              "Provide detailed diagnostic test results",
              "Get supporting statements from specialists"
            ]
          },
          {
            reason: "Policy exclusions",
            frequency: "31% of similar cases",
            suggestions: [
              "Review policy documents for exceptions or special provisions",
              "Check if procedure is covered under different coding",
              "Verify if recent policy updates have changed coverage"
            ]
          }
        ],
        legalContext: {
          relevantRegulations: [
            "Affordable Care Act §2719 - Appeals process requirements",
            "ERISA §503 - Claims procedures for employer plans",
            "State Insurance Code §10123.135 - Independent Medical Review"
          ],
          successfulArgumentsInSimilarCases: [
            "Standard of care requirements",
            "Medical consensus on treatment approach",
            "Ambiguity in policy language should favor the insured"
          ]
        },
        statisticalContext: {
          overallAppealSuccessRate: "38%",
          successFactors: [
            {
              factor: "Detailed physician letter",
              impact: "+24% success rate"
            },
            {
              factor: "Peer-reviewed medical literature",
              impact: "+18% success rate"
            },
            {
              factor: "Evidence of failed alternatives",
              impact: "+15% success rate"
            }
          ],
          timeframeData: {
            optimalSubmissionWindow: "10-30 days after denial",
            averageProcessingTime: "24 days"
          }
        }
      };
      
      // Customize based on denial reason if available
      if (denialReason) {
        const lowerDenialReason = denialReason.toLowerCase();
        
        if (lowerDenialReason.includes('medical necessity') || lowerDenialReason.includes('not medically necessary')) {
          baseAnalysis.overallAssessment.appealProbability = 0.72;
          baseAnalysis.overallAssessment.keyIssue = "Medical necessity determination challenged";
          baseAnalysis.overallAssessment.recommendedApproach = "Focus on clinical evidence and specialist opinions";
          
          baseAnalysis.commonDenialReasons = [
            {
              reason: "Medical necessity criteria not met",
              frequency: "76% of similar cases",
              suggestions: [
                "Obtain detailed letter from physician explaining necessity",
                "Reference official clinical guidelines that support necessity",
                "Document how condition meets insurer's own medical necessity criteria"
              ]
            },
            {
              reason: "Experimental/investigational determination",
              frequency: "31% of similar cases",
              suggestions: [
                "Provide peer-reviewed research showing treatment efficacy",
                "Include statistics on treatment outcomes",
                "Get statements from multiple specialists supporting treatment approach"
              ]
            },
            {
              reason: "Alternative treatments not exhausted",
              frequency: "29% of similar cases",
              suggestions: [
                "Document all previous treatments attempted",
                "Explain why alternatives are inappropriate or ineffective",
                "Include timeline showing progression of treatment approaches"
              ]
            }
          ];
        } else if (lowerDenialReason.includes('network') || lowerDenialReason.includes('out of network') || lowerDenialReason.includes('out-of-network')) {
          baseAnalysis.overallAssessment.appealProbability = 0.58;
          baseAnalysis.overallAssessment.keyIssue = "Out-of-network care coverage dispute";
          baseAnalysis.overallAssessment.recommendedApproach = "Focus on network inadequacy or emergency circumstances";
          
          baseAnalysis.commonDenialReasons = [
            {
              reason: "Out-of-network provider used",
              frequency: "82% of similar cases",
              suggestions: [
                "Document unavailability of in-network providers",
                "Prove excessive wait times for in-network care",
                "Demonstrate specialized expertise only available out-of-network"
              ]
            },
            {
              reason: "No referral or authorization",
              frequency: "54% of similar cases",
              suggestions: [
                "Show emergency nature of care needed",
                "Document attempts to contact insurer beforehand",
                "Provide evidence of referral attempts"
              ]
            },
            {
              reason: "Non-covered facility",
              frequency: "23% of similar cases",
              suggestions: [
                "Check if facility has partial coverage agreement",
                "Document medical necessity of using that specific facility",
                "Research if facility should qualify under policy terms"
              ]
            }
          ];
        } else if (lowerDenialReason.includes('authorization') || lowerDenialReason.includes('pre-auth') || lowerDenialReason.includes('prior auth')) {
          baseAnalysis.overallAssessment.appealProbability = 0.65;
          baseAnalysis.overallAssessment.keyIssue = "Prior authorization requirements dispute";
          baseAnalysis.overallAssessment.recommendedApproach = "Focus on emergency circumstances or provider communication";
          
          baseAnalysis.commonDenialReasons = [
            {
              reason: "No prior authorization obtained",
              frequency: "67% of similar cases",
              suggestions: [
                "Document emergency nature of service if applicable",
                "Provide evidence of attempts to obtain authorization",
                "Submit records of communication with insurance company"
              ]
            },
            {
              reason: "Authorization request denied",
              frequency: "42% of similar cases",
              suggestions: [
                "Challenge medical basis of authorization denial",
                "Provide new clinical information not available at time of request",
                "Include specialist opinions supporting medical necessity"
              ]
            },
            {
              reason: "Authorization obtained but claim still denied",
              frequency: "18% of similar cases",
              suggestions: [
                "Submit documentation of authorization approval",
                "Include reference numbers and dates of authorization",
                "Document names of representatives who provided authorization"
              ]
            }
          ];
        }
      }
      
      return baseAnalysis;
    } catch (error) {
      logger.error('Error analyzing denial:', error);
      return {
        error: 'Failed to analyze denial reason',
        details: error.message
      };
    }
  }

  /**
   * Analyze appeal data to provide comprehensive insights
   * @param {Object} appealData - All available data about the appeal case
   * @returns {Object} Comprehensive analysis with recommendations
   */
  async analyzeAppealData(appealData) {
    try {
      logger.info('Analyzing appeal data for comprehensive insights');
      
      // In a production system, this would use an AI model to analyze
      // the appeal data for deeper insights
      
      // For now, return a structured analysis based on available data
      const analysis = {
        strengths: [],
        weaknesses: [],
        recommendations: [],
        evidenceNeeded: [],
        appealStrategy: ''
      };
      
      // Analyze appeal type
      if (appealData.appealType) {
        switch (appealData.appealType.toLowerCase()) {
          case 'medicalnecessity':
            analysis.appealStrategy = 'Focus on clinical evidence';
            analysis.recommendations.push(
              'Include detailed letter from treating physician',
              'Reference medical literature supporting necessity',
              'Highlight symptoms and diagnosis details'
            );
            analysis.evidenceNeeded.push(
              'Medical records showing diagnosis',
              'Treatment history documentation',
              'Physician statement of necessity'
            );
            break;
            
          case 'priorauthorization':
            analysis.appealStrategy = 'Document authorization attempts';
            analysis.recommendations.push(
              'Include any evidence of attempts to obtain authorization',
              'Emphasize urgent/emergency nature of care if applicable',
              'Reference insurance policy language regarding authorizations'
            );
            analysis.evidenceNeeded.push(
              'Communication records with insurer',
              'Urgent care documentation',
              'Policy documentation'
            );
            break;
            
          case 'outofnetwork':
            analysis.appealStrategy = 'Demonstrate network inadequacy';
            analysis.recommendations.push(
              'Document unavailability of in-network providers',
              'Highlight specialized expertise needed',
              'Reference any network adequacy requirements'
            );
            analysis.evidenceNeeded.push(
              'Documentation of in-network provider search',
              'Specialty certification of provider',
              'Timeline of care needed'
            );
            break;
            
          case 'codingerror':
            analysis.appealStrategy = 'Correct coding with evidence';
            analysis.recommendations.push(
              'Include corrected claim with proper codes',
              'Provide documentation supporting correct coding',
              'Reference coding guidelines'
            );
            analysis.evidenceNeeded.push(
              'Medical documentation supporting correct codes',
              'Coding reference materials',
              'Provider statement about services performed'
            );
            break;
            
          case 'preauthconflict':
            analysis.appealStrategy = 'Focus on medical urgency and financial hardship';
            analysis.recommendations.push(
              'Document both initial and attempted second pre-authorization',
              'Emphasize medical urgency of kidney biopsy',
              'Detail financial hardship of 50% vs 80% coverage difference',
              'Request expedited review due to risk of disease progression'
            );
            analysis.evidenceNeeded.push(
              'Documentation of both pre-authorization attempts',
              'Medical documentation of kidney mass and cancer risk',
              'Physician statement on urgency and risk of delay',
              'Financial hardship statement showing inability to pay 50% cost'
            );
            break;
            
          case 'urgencyoverride':
            analysis.appealStrategy = 'Emphasize time-sensitive medical necessity';
            analysis.recommendations.push(
              'Focus on life-threatening nature of potential kidney cancer',
              'Detail medical risks of administrative delay',
              'Request expedited 24-48 hour review',
              'Reference medical literature on early intervention outcomes'
            );
            analysis.evidenceNeeded.push(
              'Imaging results of kidney mass',
              'Physician statement on urgency and risk of delay',
              'Medical literature on kidney cancer progression rates',
              'Pre-authorization documentation showing administrative barriers'
            );
            break;
            
          default:
            analysis.appealStrategy = 'Comprehensive documentation approach';
            analysis.recommendations.push(
              'Provide complete medical records',
              'Include detailed explanation of services',
              'Reference specific insurance policy provisions'
            );
            analysis.evidenceNeeded.push(
              'Complete medical records',
              'Provider statement',
              'Insurance policy documentation'
            );
        }
      }
      
      // Analyze strengths and weaknesses based on available data
      
      // Strengths
      if (appealData.diagnosisCodes && appealData.diagnosisCodes.length > 0) {
        analysis.strengths.push('Clear diagnosis codes available');
      }
      
      if (appealData.procedureCodes && appealData.procedureCodes.length > 0) {
        analysis.strengths.push('Specific procedure codes documented');
      }
      
      if (appealData.denialReason && appealData.denialReason.length > 10) {
        analysis.strengths.push('Clear denial reason identified');
      }
      
      if (appealData.serviceDescription && appealData.serviceDescription.length > 0) {
        analysis.strengths.push('Service description available');
      }
      
      // Weaknesses
      if (!appealData.diagnosisCodes || appealData.diagnosisCodes.length === 0) {
        analysis.weaknesses.push('Missing diagnosis codes');
      }
      
      if (!appealData.procedureCodes || appealData.procedureCodes.length === 0) {
        analysis.weaknesses.push('Missing procedure codes');
      }
      
      if (!appealData.denialReason || appealData.denialReason.length < 5) {
        analysis.weaknesses.push('Vague or missing denial reason');
      }
      
      if (!appealData.claimNumber) {
        analysis.weaknesses.push('Missing claim number');
      }
      
      // If we have very few strengths, add a generic one
      if (analysis.strengths.length < 2) {
        analysis.strengths.push('Opportunity to gather supporting documentation');
      }
      
      // If we have no weaknesses, add a generic one
      if (analysis.weaknesses.length === 0) {
        analysis.weaknesses.push('Insurance company may request additional information');
      }
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing appeal data:', error);
      return {
        error: 'Failed to analyze appeal data',
        details: error.message
      };
    }
  }

  /**
   * Generate a deadline warning if a deadline is approaching
   * @param {Date} deadlineDate - The deadline for the appeal
   * @returns {Object|null} Warning information or null if no warning needed
   */
  generateDeadlineWarning(deadlineDate) {
    if (!deadlineDate) {
      return null;
    }
    
    const now = new Date();
    const deadline = new Date(deadlineDate);
    const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining < 0) {
      return {
        type: 'expired',
        message: 'The appeal deadline has already passed. The insurance company may reject this appeal due to timeliness.',
        severity: 'high',
        daysRemaining
      };
    } else if (daysRemaining <= 3) {
      return {
        type: 'urgent',
        message: `Urgent: Only ${daysRemaining} day(s) remaining to submit this appeal. Submit immediately.`,
        severity: 'high',
        daysRemaining
      };
    } else if (daysRemaining <= 7) {
      return {
        type: 'warning',
        message: `Warning: Only ${daysRemaining} days remaining to submit this appeal.`,
        severity: 'medium',
        daysRemaining
      };
    } else if (daysRemaining <= 14) {
      return {
        type: 'notice',
        message: `Notice: ${daysRemaining} days remaining to submit this appeal.`,
        severity: 'low',
        daysRemaining
      };
    }
    
    return null;
  }
}

module.exports = new AIService();