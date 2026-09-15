export interface AIEnhanceResult {
  title: string;
  description: string;
  suggestedPrice: number;
  features: string[];
  tips: string[];
}

export async function enhanceListingWithAI(
  type: 'product' | 'service',
  roughTitle: string,
  category: string,
  conditionOrSkill: string,
  userNotes: string
): Promise<AIEnhanceResult> {
  try {
    const res = await fetch('/api/enhance-listing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        roughTitle,
        category,
        conditionOrSkill,
        userNotes,
      }),
    });

    if (res.ok) {
      const parsed = await res.json();
      return {
        title: parsed.title || roughTitle,
        description: parsed.description || userNotes,
        suggestedPrice: Number(parsed.suggestedPrice) || 399,
        features: Array.isArray(parsed.features) ? parsed.features : ['Quality inspected', 'Ready for immediate use'],
        tips: Array.isArray(parsed.tips) ? parsed.tips : ['Verify identity upon handover'],
      };
    }
  } catch (error) {
    console.warn('Backend Gemini AI enhancement call failed, using fallback:', error);
  }

  // Graceful rule-based enhancement fallback
  const isProd = type === 'product';
  const cleanTitle = roughTitle.trim() || (isProd ? 'Premium Equipment Rental' : 'Professional Local Service');
  
  return {
    title: isProd ? `${cleanTitle} (High Performance & Clean)` : `Professional ${cleanTitle}`,
    description: isProd
      ? `Well-maintained ${cleanTitle} in ${conditionOrSkill} condition. Thoroughly tested, sanitized, and supplied with all necessary cables, accessories, and protective bag for seamless plug-and-play use.`
      : `Experienced professional offering dependable ${cleanTitle}. Punctual service with top-tier tools, thorough attention to detail, and 100% satisfaction guarantee.`,
    suggestedPrice: isProd ? 450 : 599,
    features: isProd 
      ? ['Tested & 100% functional', 'Protective carry case included', 'Sanitized before every rental', 'Instant local pickup']
      : ['Certified & background verified', 'Brings all necessary gear', 'Flexible scheduling', 'Satisfaction guaranteed'],
    tips: [
      'Take quick photos with renter during pickup/handover for security deposit record.',
      'Check government ID before giving over the equipment.'
    ]
  };
}
