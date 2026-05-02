/**
 * Maps workspace industry keywords to the best starter guide ID.
 * IDs reference guides in guideTemplates.ts.
 */

interface IndustryMapping {
  /** Keywords to match against workspace.industry (lowercased). */
  keywords: string[];
  /** Guide ID from guideTemplates. */
  guideId: string;
  /** Friendly title for the starter card. */
  starterTitle: string;
  /** Short description of what the guide collects. */
  starterDescription: string;
}

export const industryGuideMappings: IndustryMapping[] = [
  {
    keywords: ["roofing", "roof", "construction", "contractor", "exterior", "gutter"],
    guideId: "637b3dad-0783-5638-8ceb-b1be94771a6c", // Roof / Gutter / Exterior Issue Intake
    starterTitle: "Roof & exterior inspection",
    starterDescription: "Collect pre-quote condition photos of the roof, gutters, and exterior surfaces from your customer.",
  },
  {
    keywords: ["junk", "removal", "hauling", "demo", "demolition", "cleanup"],
    guideId: "d6d5dd10-7357-5499-84a4-ad8e2d93e353", // Junk Removal / Hauling Quote
    starterTitle: "Junk removal estimate",
    starterDescription: "Get pile size, access route, and item photos so you can quote remotely.",
  },
  {
    keywords: ["hvac", "heating", "cooling", "air condition"],
    guideId: "760112c2-8d3b-5703-b6ef-42d9cbd5e223", // HVAC Service Request Intake
    starterTitle: "HVAC service request",
    starterDescription: "Capture equipment photos, model/serial plates, and symptom details before dispatching.",
  },
  {
    keywords: ["plumbing", "plumber", "pipe", "drain"],
    guideId: "e2b490f1-8a64-5f71-b975-594563f23b98", // Plumbing Service Request Intake
    starterTitle: "Plumbing service request",
    starterDescription: "Get photos of the issue area, fixtures, and access points for faster diagnosis.",
  },
  {
    keywords: ["electric", "electrical", "electrician"],
    guideId: "d5c29c02-09af-5498-9e28-990bbde178cf", // Appliance Repair Intake (closest)
    starterTitle: "Electrical service intake",
    starterDescription: "Collect panel, outlet, and issue-area photos with safety context.",
  },
  {
    keywords: ["appliance", "repair"],
    guideId: "d5c29c02-09af-5498-9e28-990bbde178cf", // Appliance Repair Intake
    starterTitle: "Appliance repair intake",
    starterDescription: "Get model/serial label shots and issue photos to diagnose before the visit.",
  },
  {
    keywords: ["field service", "equipment", "maintenance"],
    guideId: "49c8a81c-ea63-581a-bfe6-19b0fecb372b", // Equipment Issue Intake
    starterTitle: "Equipment service intake",
    starterDescription: "Capture equipment overview, labels, error codes, and issue areas.",
  },
  {
    keywords: ["real estate", "realty", "realtor", "broker"],
    guideId: "421836bd-dfcf-5a29-af4d-e7d2f31c7f77", // Move-In / Move-Out Condition Report
    starterTitle: "Property condition report",
    starterDescription: "Document move-in/move-out condition with room-by-room photos.",
  },
  {
    keywords: ["property management", "property manager", "landlord", "rental"],
    guideId: "3411077b-0074-5f7f-a61e-12919bdca76a", // Tenant Maintenance Request
    starterTitle: "Tenant maintenance request",
    starterDescription: "Let tenants submit maintenance issues with photos and details.",
  },
  {
    keywords: ["insurance", "claim", "adjuster", "loss"],
    guideId: "43e3d7ca-7a5a-5bcb-8cbd-4dbbafe39f63", // Property Damage Claim Packet
    starterTitle: "Damage claim documentation",
    starterDescription: "Collect structured damage photos, context, and supporting docs for claims.",
  },
  {
    keywords: ["ecommerce", "e-commerce", "retail", "warranty", "support"],
    guideId: "58e10847-6890-5cda-a16e-3ab2b821f5c3", // Product Defect / Warranty Claim
    starterTitle: "Product warranty claim",
    starterDescription: "Have customers submit defect photos, purchase proof, and issue details.",
  },
  {
    keywords: ["apparel", "fashion", "manufacturing", "product dev", "sample", "defect"],
    guideId: "a38caf9b-fea8-50fa-a0a4-ab151ae4b68b", // Clothing Resale Listing
    starterTitle: "Product sample documentation",
    starterDescription: "Capture product condition, measurements, labels, and defect close-ups.",
  },
  {
    keywords: ["auto", "automotive", "car", "vehicle", "fleet", "body shop"],
    guideId: "5de52e51-cab1-56a5-856f-f955bebb0c22", // Auto Body Damage Estimate
    starterTitle: "Vehicle damage intake",
    starterDescription: "Get damage photos from multiple angles plus VIN and mileage.",
  },
  {
    keywords: ["healthcare", "care", "home health", "home services", "vet", "veterinary"],
    guideId: "e0e1f53a-58e2-5935-a360-08755f2d5376", // Veterinary Concern Documentation
    starterTitle: "Care intake documentation",
    starterDescription: "Collect condition photos, symptom details, and relevant history.",
  },
  {
    keywords: ["marketing", "creative", "agency", "content", "brand"],
    guideId: "a8d83fd4-09b0-5a42-a4ad-a3e803c614f1", // Brand / Product Content Audit
    starterTitle: "Marketing content capture",
    starterDescription: "Guide photo and video capture for product shoots and social content.",
  },
  {
    keywords: ["landscaping", "landscape", "lawn", "yard", "garden", "tree"],
    guideId: "d6d5dd10-7357-5499-84a4-ad8e2d93e353", // Landscape reuses junk/hauling scope
    starterTitle: "Landscape quote intake",
    starterDescription: "Get yard photos, measurements, and scope details for accurate quoting.",
  },
  {
    keywords: ["pest", "wildlife", "exterminator", "termite"],
    guideId: "d6d5dd10-7357-5499-84a4-ad8e2d93e353", // closest scope quote
    starterTitle: "Pest activity intake",
    starterDescription: "Collect evidence photos, entry points, and activity areas.",
  },
];

/** Default fallback guide if no industry match. */
export const defaultStarterGuide = {
  guideId: "f83aa2dd-ec4c-5493-b513-ddb155e7582d", // Area Scope Quote Intake
  starterTitle: "General service quote intake",
  starterDescription: "Collect site photos, scope details, and access information from your customer.",
};

/** Find the best starter guide for a workspace industry string. */
export function getStarterForIndustry(industry: string | null | undefined) {
  if (!industry) return defaultStarterGuide;
  const lower = industry.toLowerCase();
  for (const mapping of industryGuideMappings) {
    if (mapping.keywords.some((kw) => lower.includes(kw))) {
      return mapping;
    }
  }
  return defaultStarterGuide;
}
