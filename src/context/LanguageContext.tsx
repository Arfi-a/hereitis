/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Brand & Header
  appTitle: { en: 'Sanad ER Command Center', ar: 'مركز سند للقيادة والتحكم بالطوارئ' },
  appTagline: { en: 'Operational Clinical Intelligence', ar: 'ذكاء تشغيلي وسريري متكامل' },
  hospitalName: { en: 'Sheikh Khalifa Emergency Hospital', ar: 'مستشفى الشيخ خليفة للطوارئ' },
  simulatedDataTag: { en: 'Simulated Data · Health-Informatics Demo', ar: 'بيانات تجريبية محاكاة · مسابقة المعلوماتية الصحية' },

  // Roles
  roleChargeNurse: { en: 'Charge Nurse', ar: 'مسؤول التمريض' },
  roleDoctor: { en: 'Attending Physician', ar: 'الطبيب المناوب' },
  roleAdmin: { en: 'Administrator & Audit', ar: 'الإدارة والتدقيق' },
  rolePharmacy: { en: 'Supply & Pharmacy', ar: 'المستودع والصيدلية' },

  // Diversion Status
  diversionNormal: { en: 'Normal Intake', ar: 'استقبال اعتيادي' },
  diversionAmber: { en: 'Surge Advisory', ar: 'ضغط تدفق ملحوظ' },
  diversionRed: { en: 'Full Diversion', ar: 'إشغال كامل / تحويل' },
  diversionAlertMsg: { en: 'Ambulances being notified to redirect', ar: 'يتم حالياً إشعار الإسعاف الوطني بالتحويل' },

  // Scenarios
  scenarioNormal: { en: 'Normal Day', ar: 'يوم اعتيادي' },
  scenarioCollision: { en: 'Highway Collision (E311)', ar: 'حادث طريق E311 المتعدد' },
  scenarioHeatstroke: { en: 'Heat-Stroke Surge', ar: 'موجة إجهاد حراري صيفية' },
  scenarioDuststorm: { en: 'Dust-Storm Respiratory', ar: 'عاصفة ترابية وتنفسية' },
  scenarioSelector: { en: 'Active Scenario', ar: 'السيناريو النشط' },
  resetScenario: { en: 'Reset Simulation', ar: 'إعادة ضبط المحاكاة' },
  surgeModeActive: { en: 'SURGE MODE ACTIVE', ar: 'حالة الطوارئ القصوى مفعلة' },

  // KPIs
  kpiBedsFree: { en: 'Beds Free (Hospital / ER)', ar: 'الأسِرّة الشاغرة (المستشفى / الطوارئ)' },
  kpiEquipment: { en: 'Equipment in Use / Free', ar: 'المعدات الطبية (مستخدمة / شاغرة)' },
  kpiOperatingTheatres: { en: 'Operating Theatres Available', ar: 'غرف العمليات المتاحة' },
  kpiAvgWait: { en: 'Avg Door-to-Doctor Wait', ar: 'متوسط وقت الانتظار حتى الطبيب' },
  kpiPatientsWaiting: { en: 'Patients in Waiting / Triage', ar: 'المرضى في الانتظار والفرز' },
  minUnit: { en: 'min', ar: 'دقيقة' },
  bedsUnit: { en: 'beds', ar: 'سرير' },
  ptsUnit: { en: 'patients', ar: 'مرضى' },

  // Floor Plan & Zones
  floorPlanTitle: { en: 'Emergency Beds & Layout', ar: 'أسِرّة الطوارئ والأقسام' },
  ambulanceBay: { en: 'Ambulance Arrival Bay', ar: 'منطقة وصول الإسعاف' },
  triageZone: { en: 'Triage Assessment', ar: 'منطقة الفرز الأولي' },
  waitingZone: { en: 'Waiting Room', ar: 'صالة الانتظار' },
  resusZone: { en: 'Resuscitation (Beds R1-R4)', ar: 'الإنعاش الفوري (R1-R4)' },
  acuteBays: { en: 'Acute Treatment Bays', ar: 'أقسام الحالات الحادة' },
  subacuteBays: { en: 'Sub-Acute Bays', ar: 'أقسام الحالات شبه الحادة' },
  fastTrackZone: { en: 'Fast Track Clinic', ar: 'العيادة السريعة' },
  imagingZone: { en: 'Emergency Imaging (CT/X-Ray)', ar: 'الأشعة والتصوير التشخيصي' },

  // Bed Statuses
  bedOccupied: { en: 'Occupied', ar: 'مشغول' },
  bedFree: { en: 'Free', ar: 'شاغر' },
  bedCleaning: { en: 'Needs Cleaning', ar: 'قيد التعقيم والتجهيز' },
  bedReserved: { en: 'Reserved', ar: 'محجوز لحالة طارئة' },
  bedUnknown: { en: 'Unknown (Sensor Silent)', ar: 'غير معروف (انقطاع الحساس)' },

  // Ambulance Panel
  ambulancePanelTitle: { en: 'Incoming Pre-Hospital Ambulances', ar: 'سيارات الإسعاف القادمة' },
  etaLabel: { en: 'ETA', ar: 'الوصول بعد' },
  preArrivalESI: { en: 'Pre-Arrival ESI', ar: 'مستوى الفرز المتوقع' },
  vitalsSummary: { en: 'Telemetry Vitals', ar: 'العلامات الحيوية' },
  destinationBay: { en: 'Assigned Bay', ar: 'السرير المخصص' },
  reroutedTo: { en: 'Rerouted to', ar: 'تم التحويل إلى' },

  // Patient List
  patientQueueTitle: { en: 'Patient Census & Triage Queue', ar: 'قائمة المرضى وطابور الفرز' },
  allESI: { en: 'All ESI', ar: 'جميع المستويات' },
  filterByESI: { en: 'Filter by ESI', ar: 'تصفية حسب الفرز' },
  searchPatient: { en: 'Search patient, bed, or complaint...', ar: 'بحث بالاسم، السرير، أو الشكوى...' },
  waitingForICUBed: { en: 'Admitted, waiting for inpatient ICU bed', ar: 'مقبول، بانتظار توفر سرير عناية مركزة' },
  waitingForWardBed: { en: 'Admitted, waiting for general ward bed', ar: 'مقبول، بانتظار توفر سرير قسم عام' },
  chiefComplaint: { en: 'Chief Complaint', ar: 'الشكوى الرئيسية' },
  clinician: { en: 'Clinician', ar: 'الطبيب المعالج' },
  waitTime: { en: 'Wait Time', ar: 'مدة الانتظار' },

  // Nurse Request Bar
  requestBarTitle: { en: 'Point-of-Care Nurse Requests', ar: 'شريط طلبات التمريض السريع' },
  tabSupplies: { en: 'Consumables & Supplies', ar: 'المستلزمات والمستهلكات' },
  tabMedicines: { en: 'Doctor-Ordered Medications', ar: 'الأدوية المعتمدة من الطبيب' },
  tabMyRequests: { en: 'Active Trackers', ar: 'متابعة الطلبات الجارية' },
  selectBed: { en: 'Target Bed / Room', ar: 'السرير / الغرفة' },
  selectItem: { en: 'Select Item', ar: 'اختر المستلزم' },
  quantity: { en: 'Qty', ar: 'الكمية' },
  urgencyNormal: { en: 'Normal', ar: 'عادي' },
  urgencyUrgent: { en: 'Urgent', ar: 'عاجل' },
  urgencyStat: { en: 'STAT (Immediate)', ar: 'فوري جداً (STAT)' },
  btnSendRequest: { en: 'Dispatch Request', ar: 'إرسال الطلب' },
  doctorOrdersNotice: { en: 'Only doctor-verified clinical orders appear here. Tap to trigger pharmacy dispensing.', ar: 'تظهر هنا فقط الأدوية المعتمدة مسبقاً من الطبيب. اضغط لبدء التجهيز بالصيدلية.' },
  btnRequestDelivery: { en: 'Request Delivery', ar: 'طلب إرسال الدواء' },

  // Request statuses
  stepRequested: { en: 'Requested', ar: 'تم الطلب' },
  stepPreparing: { en: 'Preparing in Pharmacy', ar: 'قيد التجهيز بالصيدلية' },
  stepOnTheWay: { en: 'On The Way (Pneumatic/Runner)', ar: 'في الطريق عبر الناقل' },
  stepDelivered: { en: 'Delivered to Bay', ar: 'تم التسليم عند السرير' },

  // Operating Theatres
  otPanelTitle: { en: 'Emergency Surgical Theatres (OT 1-4)', ar: 'غرف العمليات الجراحية الطارئة (1-4)' },
  otInUse: { en: 'In Surgery', ar: 'قيد إجراء جراحي' },
  otCleaning: { en: 'Turnover & Sterilisation', ar: 'تعقيم وتجهيز' },
  otAvailable: { en: 'Available Immediately', ar: 'متاحة فوراً' },
  otReserved: { en: 'Reserved for Emergency', ar: 'محجوزة لطوارئ قادمة' },
  otSurgeon: { en: 'Surgeon', ar: 'الجراح' },
  otAnaesthetist: { en: 'Anaesthetist', ar: 'طبيب التخدير' },
  otNextAvailable: { en: 'Next available in', ar: 'متاحة خلال' },
  otBottleneckWarning: { en: 'OT bottleneck expected in ~40 min: 2 surgeries running late, 3 incoming traumas', ar: 'تنبؤ باختناق في العمليات خلال 40 دقيقة: عمليتان تجاوزتا الوقت المتوقع و3 إصابات قادمة' },

  // Equipment
  equipmentPanelTitle: { en: 'Critical Equipment Availability', ar: 'جاهزية الأجهزة والمعدات الحرجة' },
  eqVentilators: { en: 'Mechanical Ventilators', ar: 'أجهزة التنفس الاصطناعي' },
  eqDefibrillators: { en: 'Crash Cart Defibrillators', ar: 'أجهزة الصدمات الكهربائية' },
  eqMonitors: { en: 'Multiparameter Monitors', ar: 'شاشات مراقبة المرضى' },
  eqInfusionPumps: { en: 'IV Infusion Pumps', ar: 'مضخات المحاليل الوريدية' },
  eqUltrasound: { en: 'Point-of-Care Ultrasound (POCUS)', ar: 'أجهزة السونار المتنقلة' },
  eqWheelchairs: { en: 'Transport Wheelchairs', ar: 'كراسي النقل' },
  eqFree: { en: 'Free', ar: 'شاغر' },
  eqInUse: { en: 'In Use', ar: 'مستخدم' },
  eqCleaning: { en: 'Sanitising', ar: 'تعقيم' },
  eqMaint: { en: 'Service', ar: 'صيانة' },

  // Sanad Suggestions
  suggestionsTitle: { en: 'Sanad Clinical Suggestions', ar: 'مقترحات نظام سند الاستباقية' },
  humanInLoopBadge: { en: 'Human-in-the-Loop AI', ar: 'تحت إشراف الطاقم البشري' },
  btnApprove: { en: 'Approve & Execute', ar: 'موافقة وتنفيذ' },
  btnDismiss: { en: 'Dismiss', ar: 'تجاهل' },

  // Charts
  analyticsTitle: { en: 'Emergency Flow & Resource Analytics', ar: 'تحليلات التدفق والمخزون' },
  arrivalsByHour: { en: 'Hourly Patient Influx', ar: 'تدفق المرضى لكل ساعة' },
  occupancyTrend: { en: 'Bed Occupancy Rate', ar: 'نسبة إشغال الأسِرّة' },
  waitTrend: { en: 'Door-to-Doctor Wait (min)', ar: 'متوسط الانتظار (دقيقة)' },
  esiDonut: { en: 'Triage Severity Distribution (ESI 1-5)', ar: 'توزيع مستويات الفرز (ESI 1-5)' },
  inventoryLevels: { en: 'Critical Stock Reserves (Hours Remaining)', ar: 'احتياطي المخزون الحرج (ساعات متبقية)' },
  range2h: { en: '2 Hours', ar: 'ساعتان' },
  range6h: { en: '6 Hours', ar: '6 ساعات' },
  range12h: { en: '12 Hours', ar: '12 ساعة' },
  rangeToday: { en: 'Today', ar: 'اليوم' },

  // Patient Drawer
  tabOverview: { en: 'Overview & Triage', ar: 'الملخص والفرز' },
  tabVitals: { en: 'Continuous Vitals', ar: 'العلامات الحيوية' },
  tabTimeline: { en: 'Clinical Timeline', ar: 'التسلسل الزمني للرعاية' },
  tabOrders: { en: 'Medications & Supplies', ar: 'الأدوية والمستلزمات' },
  tabDisposition: { en: 'Disposition & Bed Hold', ar: 'خطة الخروج والتسكين' },
  tabFHIR: { en: 'HL7 FHIR R4 Standard', ar: 'معيار HL7 FHIR الدولي' },
  allergies: { en: 'Allergies', ar: 'الحساسية الدوائية' },
  closeDrawer: { en: 'Close Record', ar: 'إغلاق الملف' },
  noAllergies: { en: 'No known drug allergies (NKDA)', ar: 'لا توجد حساسية دوائية معروفة' },

  // Standards & Legal
  standardsTitle: { en: 'Healthcare Informatics & Safety Standards', ar: 'معايير المعلوماتية الصحية والامتثال' },
  complianceUAE: { en: 'UAE Federal Health Data Law No. 2/2019 (In-country hosting & pseudonymisation)', ar: 'قانون البيانات الصحية الاتحادي الإماراتي رقم 2/2019 (حفظ محلي وحماية الهوية)' },
  complianceFHIR: { en: 'HL7 FHIR R4 (Observation, Encounter, Location, AuditEvent)', ar: 'معيار HL7 FHIR R4' },
  complianceCodes: { en: 'LOINC & SNOMED CT Clinical Ontologies', ar: 'تصنيفات LOINC و SNOMED CT العالمية' },
  complianceWCAG: { en: 'WCAG 2.2 Level AA Accessibility & High-Contrast Display Mode', ar: 'معيار الوصول الرقمي WCAG 2.2 AA' },
  complianceMalaffi: { en: 'Malaffi & Nabidh Interoperability Ready', ar: 'جاهزية الربط مع منصتي ملفي ونبض' },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextProps>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  isRTL: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || translations[key].en;
    }
    return key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
