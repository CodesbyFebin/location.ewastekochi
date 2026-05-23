export interface StateRegulation {
  state: string;
  policy: string;
  authority: string;
  ruleTitle: string;
  compliancePrerequisite: string;
  fineNotice: string;
  greenRating: string;
}

export const stateRegulations: Record<string, StateRegulation> = {
  kerala: {
    state: "Kerala",
    authority: "KSPCB (Kerala State Pollution Control Board)",
    ruleTitle: "E-Waste Management Rules 2022 & LSGD Circular 41/2024",
    policy: "Strict decentralised urban local agency collection. Mandatory registration of commercial electronic scrap shipments.",
    compliancePrerequisite: "Form 6 Manifest tracking required for transport. Local urban councils issue green clearance stamps.",
    fineNotice: "Non-compliant battery/hazardous landfills subject to severe municipal penalties up to ₹50,000.",
    greenRating: "Class-A Green State Compliance"
  },
  maharashtra: {
    state: "Maharashtra",
    authority: "MPCB (Maharashtra Pollution Control Board)",
    ruleTitle: "Maharashtra E-Waste Framework & Environment Act (Section 5)",
    policy: "Massive industrial cluster mandates. Formalised IT asset disposal audits required for SEZ and IT-parks.",
    compliancePrerequisite: "Form 3 & Form 6 recycling records mandatory for annual BRSR disclosure.",
    fineNotice: "Improper dumping of corporate server hardware is subject to up to ₹1,00,000 under industrial audit notices.",
    greenRating: "Industrial Grade Audit Comp"
  },
  karnataka: {
    state: "Karnataka",
    authority: "KSPCB (Karnataka State Pollution Control Board)",
    ruleTitle: "Karnataka ITAD Regulations & Digital Media Disposal Act 2023",
    policy: "High density IT estate rulebooks. Extended Producer Responsibility (EPR) strict tracking on IT servers & lithium cells.",
    compliancePrerequisite: "Requires certified digital data sanitisation (NIST 800-88) before hardware handover.",
    fineNotice: "Corporate technology labs disposing storage systems to informal scrap merchants risk immediate trade-license holds.",
    greenRating: "Tech-HQ Authorized Safe Zone"
  },
  "tamil nadu": {
    state: "Tamil Nadu",
    authority: "TNPCB (Tamil Nadu Pollution Control Board)",
    ruleTitle: "TNPCB E-Scrap Hub Policy & Circular 9/TN",
    policy: "Industrial automation and semiconductor recycling framework. Public deposit banks for citizen e-waste.",
    compliancePrerequisite: "Authorized recyclers must provide serial-tracked Material Recovery Certificates.",
    fineNotice: "Violations of lead-acid cell collection standards face ₹75,000 environmental compensation fine.",
    greenRating: "E-Governance Green Certified"
  },
  delhi: {
    state: "Delhi",
    authority: "DPCC (Delhi Pollution Control Committee)",
    ruleTitle: "NCR Green Environment Action Plan & E-waste Clean-up Order 2024",
    policy: "Emergency hazardous air & landfill control. Complete prohibition of informal burning or open acid-stripping in NCR.",
    compliancePrerequisite: "Mandatory routing only to approved formal recyclers with green tracking certificates.",
    fineNotice: "Illegal commercial e-waste transport or storage risks instantaneous warehouse seals and penal prosecution.",
    greenRating: "Strict NCR Zero-Tolerance Zone"
  },
  telangana: {
    state: "Telangana",
    authority: "TSPCB (Telangana State Pollution Control Board)",
    ruleTitle: "Telangana ICT Green Agenda & ITAD Corporate Charter",
    policy: "Cyberabad IT hub compliance guidelines. High frequency audits on microchip and server decommissioning.",
    compliancePrerequisite: "Asset tagging and online manifest submission on TSPCB corporate portal.",
    fineNotice: "Improper hardware scrap sales face heavy licensing review and environmental restoration penalties.",
    greenRating: "Class-A Cyber Corridor Audit"
  },
  "west bengal": {
    state: "West Bengal",
    authority: "WBPCB (West Bengal Pollution Control Board)",
    ruleTitle: "WBPCB E-Cycle Ordinance & Hazardous Materials Act",
    policy: "Eastern region formalization. Focus on retail scrap, computer terminals and marine electronics recycling standard.",
    compliancePrerequisite: "E-discharge slip required for all academic and corporate hardware disposals.",
    fineNotice: "Severe regulatory consequences for open dumpsters processing cathode ray tubes (CRT) near rivers.",
    greenRating: "Coastal River-Safe Protocol"
  }
};

export function getStateRegulation(stateName: string): StateRegulation {
  const key = stateName.toLowerCase();
  
  if (stateRegulations[key]) {
    return stateRegulations[key];
  }
  
  // Return a robust default for generic pan-India states
  return {
    state: stateName,
    authority: "CPCB (Central Pollution Control Board) & State PCB",
    ruleTitle: "National E-Waste Management Rules 2022 Implementation",
    policy: "EPR implementation and state-level PCB monitored formal recycling collection centers.",
    compliancePrerequisite: "Standard electronic waste manifests and serial inventory checklists required.",
    fineNotice: "Mishandling of toxic components is subject to environmental compensation charges.",
    greenRating: "Standard CPCB Compliance"
  };
}
