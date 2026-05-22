import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "zh";

const translations = {
  en: {
    // Header
    dashboardTitle: "ClynicQ Dashboard",
    dashboardSubtitle: "Operational visibility for walk-ins and patient booking traffic",

    // Tabs
    queueManagement: "Today's Patients",
    bookingRequests: "Booking Log",
    appointments: "Appointments",
    automation: "Automation",
    doctorSchedule: "Doctor Schedule",
    doctorProfiles: "Doctor Profiles",

    // Queue Controls
    pauseQueue: "Pause Queue",
    resumeQueue: "Resume Queue",
    closeQueue: "Close Queue",
    reopenQueue: "Reopen Queue",

    // Daily Summary
    totalQueueToday: "Live Queue",
    bookingsToday: "Booking Redirects",
    arrived: "Arrived",
    cancelled: "Cancelled",
    noShows: "No Shows",
    avgWaitTime: "Avg Wait Time",

    // Queue Table
    queueNo: "Queue No",
    status: "Status",
    timeJoined: "Queue Joined",
    checkInCode: "Check-in Code",
    actions: "Actions",
    verifyAndArrive: "Verify & Arrived",
    cancel: "Adjust",
    noShow: "No Show",
    completed: "Completed",
    undo: "Undo",
    noPatients: "No patients in queue",

    // Adjust Queue
    adjustQueueTitle: "Adjust Queue",
    adjustCurrentPosition: "Current Position",
    adjustNewPosition: "New Position",
    adjustMoveUp: "Move Up",
    adjustMoveDown: "Move Down",
    adjustMoveToTop: "Move to Top",
    adjustMoveToBottom: "Move to Bottom",
    adjustReason: "Reason",
    adjustSelectReason: "Select a reason",
    adjustReasonSteppedAway: "Patient stepped away",
    adjustReasonPriority: "Priority case",
    adjustReasonMistake: "Staff input mistake",
    adjustReasonReturned: "Returned to queue",
    adjustReasonMovedService: "Moved to another service/doctor",
    adjustReasonOther: "Other",
    adjustNote: "Note (Optional)",
    adjustNotePlaceholder: "Add a note (max 100 chars)",
    adjustCancel: "Cancel",
    adjustSave: "Save Adjustment",
    adjustErrorPosition: "Enter a valid position",
    adjustErrorReason: "Reason is required",
    adjustToast: "Queue updated",
    adjustLogMessage: "moved {queue} from #{from} to #{to}. Reason: {reason}",

    // Status Badges
    statusWaiting: "Waiting",
    statusArrived: "Arrived",
    statusLate: "Late",
    statusCancelled: "Cancelled",
    statusNoShow: "No Show",
    statusCompleted: "Completed",
    statusBooked: "Booked",

    // Live Queue
    liveQueueView: "Today's Patient Flow",
    patientTypeCol: "Type",
    apptTimeCol: "Appt Time",
    typeWalkIn: "Walk-in",
    typeBooking: "Expected Arrival",
    addToQueue: "Add to Queue",

    // Check-in Dialog
    verifyCheckIn: "Verify Check-In",
    enterCheckInCode: "Enter the patient's check-in code to verify arrival.",
    queueNumber: "Queue Number",
    patientName: "Patient Name",
    checkInCodeLabel: "Check-in Code",
    enterCode: "Enter code",
    invalidCode: "Invalid code. Please try again.",
    verifyAndMarkArrived: "Verify & Mark Arrived",
    markArrivedNoCode: "Mark as Arrived (No Code)",

    // Add to Queue Dialog
    addToQueueTitle: "Add to Queue",
    addToQueueDesc: "Add a new patient to the queue. Only mobile number is required.",
    nameOptional: "Name (Optional)",
    enterPatientName: "Enter patient name",
    mobileNumber: "Mobile Number",
    enterMobile: "Enter mobile number",
    emailOptional: "Email (Optional)",
    enterEmail: "Enter email for contact",
    queueSource: "Queue Source",
    walkIn: "Walk-in",
    phoneBooking: "Phone Booking",
    other: "Other",
    visitCategory: "Visit Category (Optional)",
    consultation: "Consultation",
    followUp: "Follow-up",
    generalTreatment: "General Treatment",
    standardVisit: "Standard Visit",
    scanNRIC: "Scan NRIC Barcode",
    scanSingpass: "Scan Singpass QR",
    scanNRICDesc: "Place NRIC barcode under scanner to retrieve patient info",
    scanSingpassDesc: "Scan Singpass QR code to retrieve patient info",
    orManualEntry: "or enter manually",
    notesOptional: "Notes (Optional)",
    internalNotes: "Internal notes only",
    addedToQueue: "Added to queue",
    patientAddedToQueue: "Patient has been added to the queue",
    mobileRequired: "Mobile number required",
    pleaseEnterMobile: "Please enter a mobile number",

    // Visit Log / Records
    visitLog: "Visit Log",
    collapse: "Collapse",
    expand: "Expand",
    noCompletedVisits: "No completed visits yet",
    joinedQ: "Joined Q",
    completedCol: "Completed",
    durationCol: "Duration",
    visitCategoryCol: "Visit Category",
    emailMobile: "Email / Mobile",
    appointmentTime: "Appointment Time (External Calendar)",
    notes: "Notes",
    appointmentBookings: "Appointment Bookings",
    queueVisits: "Queue Visits",
    visitLogNote: "Note: No medical records, billing, or diagnosis stored. Queue and booking tracking only.",

    // Walk-in & Booking Records
    walkinRecordsTitle: "Walk-in Records (Last 30 Days)",
    bookingRecordsTitle: "Booking Records (Last 30 Days)",
    downloadCSV: "Download CSV",
    visitDate: "Visit Date",
    arrivalTime: "Arrival Time",
    appointmentDateTime: "Appointment Date & Time",
    arrivalStatus: "Arrival Status",
    noWalkinRecords: "No walk-in records yet",
    noBookingRecords: "No booking records yet",

    // Booking Requests
    bookingRequestsTitle: "Booking Requests",
    bookingRequestsDesc: "Incoming booking interest — no action required.",
    caseId: "Case ID",
    mobile: "Mobile",
    preferredDateTime: "Preferred Date/Time",
    source: "Source",
    timestamp: "Timestamp",
    noBookingRequests: "No booking requests yet",
    new: "New",

    // Patient Detail
    patientDetails: "Patient Details",
    quickActions: "Quick Actions",
    sendMessage: "Send Message",
    logVisit: "Log Visit",
    profile: "Profile",
    signOut: "Sign out",

    // Footer
    footerText: "ClynicQ is a platform operated by EALVON PTE. LTD.",

    // Language
    language: "Language",
  },
  zh: {
    // Header
    dashboardTitle: "ClynicQ 仪表板",
    dashboardSubtitle: "现场挂号与患者预约流量的运营可视化",

    // Tabs
    queueManagement: "今日患者",
    bookingRequests: "预约记录",
    appointments: "预约",
    automation: "自动化",
    doctorSchedule: "医生排班",
    doctorProfiles: "医生档案",

    // Queue Controls
    pauseQueue: "暂停排队",
    resumeQueue: "恢复排队",
    closeQueue: "关闭排队",
    reopenQueue: "重新开放排队",

    // Daily Summary
    totalQueueToday: "现场排队",
    bookingsToday: "预约",
    arrived: "已到达",
    cancelled: "已取消",
    noShows: "未到",
    avgWaitTime: "平均等候时间",

    // Queue Table
    queueNo: "排队号",
    status: "状态",
    timeJoined: "加入时间",
    checkInCode: "签到码",
    actions: "操作",
    verifyAndArrive: "验证并到达",
    cancel: "调整",
    noShow: "未到",
    completed: "已完成",
    undo: "撤销",
    noPatients: "排队中没有患者",

    // Adjust Queue
    adjustQueueTitle: "调整排队",
    adjustCurrentPosition: "当前位置",
    adjustNewPosition: "新位置",
    adjustMoveUp: "上移",
    adjustMoveDown: "下移",
    adjustMoveToTop: "移到最前",
    adjustMoveToBottom: "移到最后",
    adjustReason: "原因",
    adjustSelectReason: "选择原因",
    adjustReasonSteppedAway: "患者暂时离开",
    adjustReasonPriority: "优先案例",
    adjustReasonMistake: "工作人员输入错误",
    adjustReasonReturned: "返回排队",
    adjustReasonMovedService: "转至其他服务/医生",
    adjustReasonOther: "其他",
    adjustNote: "备注（可选）",
    adjustNotePlaceholder: "添加备注（最多100字）",
    adjustCancel: "取消",
    adjustSave: "保存调整",
    adjustErrorPosition: "请输入有效位置",
    adjustErrorReason: "原因为必填项",
    adjustToast: "排队已更新",
    adjustLogMessage: "将 {queue} 从 #{from} 移到 #{to}。原因：{reason}",

    // Status Badges
    statusWaiting: "等待中",
    statusArrived: "已到达",
    statusLate: "迟到",
    statusCancelled: "已取消",
    statusNoShow: "未到",
    statusCompleted: "已完成",
    statusBooked: "已预约",

    // Live Queue
    liveQueueView: "今日患者流",
    patientTypeCol: "类型",
    apptTimeCol: "预约时间",
    typeWalkIn: "现场挂号",
    typeBooking: "预约到访",
    addToQueue: "加入排队",

    // Check-in Dialog
    verifyCheckIn: "验证签到",
    enterCheckInCode: "输入患者签到码以验证到达。",
    queueNumber: "排队号码",
    patientName: "患者姓名",
    checkInCodeLabel: "签到码",
    enterCode: "输入验证码",
    invalidCode: "验证码无效，请重试。",
    verifyAndMarkArrived: "验证并标记到达",
    markArrivedNoCode: "标记到达（无验证码）",

    // Add to Queue Dialog
    addToQueueTitle: "加入排队",
    addToQueueDesc: "将新患者加入排队。仅需手机号码。",
    nameOptional: "姓名（可选）",
    enterPatientName: "输入患者姓名",
    mobileNumber: "手机号码",
    enterMobile: "输入手机号码",
    emailOptional: "电邮（可选）",
    enterEmail: "输入联系电邮",
    queueSource: "排队来源",
    walkIn: "现场挂号",
    phoneBooking: "电话预约",
    other: "其他",
    visitCategory: "就诊类别（可选）",
    consultation: "咨询",
    followUp: "复诊",
    generalTreatment: "一般治疗",
    standardVisit: "标准就诊",
    scanNRIC: "扫描NRIC条码",
    scanSingpass: "扫描Singpass二维码",
    scanNRICDesc: "将NRIC条码放在扫描器下以获取患者信息",
    scanSingpassDesc: "扫描Singpass二维码以获取患者信息",
    orManualEntry: "或手动输入",
    notesOptional: "备注（可选）",
    internalNotes: "仅限内部备注",
    addedToQueue: "已加入排队",
    patientAddedToQueue: "患者已加入排队",
    mobileRequired: "需要手机号码",
    pleaseEnterMobile: "请输入手机号码",

    // Visit Log / Records
    visitLog: "就诊记录",
    collapse: "收起",
    expand: "展开",
    noCompletedVisits: "暂无已完成的就诊",
    joinedQ: "加入排队",
    completedCol: "已完成",
    durationCol: "时长",
    visitCategoryCol: "就诊类别",
    emailMobile: "电邮 / 手机",
    appointmentTime: "预约时间（外部日历）",
    notes: "备注",
    appointmentBookings: "预约挂号",
    queueVisits: "排队就诊",
    visitLogNote: "注意：不存储病历、账单或诊断信息。仅用于排队和预约追踪。",

    // Walk-in & Booking Records
    walkinRecordsTitle: "现场挂号记录（最近30天）",
    bookingRecordsTitle: "预约记录（最近30天）",
    downloadCSV: "下载CSV",
    visitDate: "就诊日期",
    arrivalTime: "到达时间",
    appointmentDateTime: "预约日期和时间",
    arrivalStatus: "到达状态",
    noWalkinRecords: "暂无现场挂号记录",
    noBookingRecords: "暂无预约记录",

    // Booking Requests
    bookingRequestsTitle: "预约请求",
    bookingRequestsDesc: "收到的预约意向 — 无需操作。",
    caseId: "案例编号",
    mobile: "手机号",
    preferredDateTime: "首选日期/时间",
    source: "来源",
    timestamp: "时间戳",
    noBookingRequests: "暂无预约请求",
    new: "新",

    // Patient Detail
    patientDetails: "患者详情",
    quickActions: "快捷操作",
    sendMessage: "发送消息",
    logVisit: "记录就诊",
    profile: "个人资料",
    signOut: "退出登录",

    // Footer
    footerText: "ClynicQ 是由 EALVON PTE. LTD. 运营的平台。",

    // Language
    language: "语言",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("clynicq-lang");
    return (saved === "zh" ? "zh" : "en") as Language;
  });

  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem("clynicq-lang", newLang);
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};
