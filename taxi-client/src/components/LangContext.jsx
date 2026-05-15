import { createContext, useContext, useState } from "react";

const translations = {
  en: {
    // Nav
    home: "Home", search: "Search", about: "About Us", chat: "Chat",
    booking: "Booking", feedback: "Feedback", myBookings: "My Bookings",
    login: "Login", register: "Register", logout: "Logout",
    darkMode: "Dark Mode", lightMode: "Light Mode", dashboard: "Dashboard",

    // Welcome
    welcome: "Welcome !", getStarted: "Get Started",

    // Home
    lowPricesTitle: "Your pick of rides at low prices",
    lowPricesText: "Find the ideal ride from our extensive list of locations and routes at affordable pricing, whether you're traveling by bus or carpooling.",
    trustTitle: "Have faith in the people you travel with.",
    trustText: "We spend time getting to know each of our bus partners and members. We verify IDs, reviews, and profiles so you can book your trip on our safe platform with confidence and know who you're traveling with.",
    easyTitle: "Scroll, click, tap and go!",
    easyText: "It's never been so simple to book a ride! Thanks to our easy software driven by outstanding technology, you may schedule a ride close to you in only minutes.",

    // Login
    loginTitle: "Login", signUp: "Sign up",
    emailAddress: "Email Address", password: "Password",
    forgotPassword: "Forgot Password?", loggingIn: "Logging in…",
    noDriverAccount: "No driver account? ", newHere: "New here? ",
    wrongCredentials: "Wrong email or password.", fillAllFields: "Please fill in all fields.",

    // Register
    customerRegister: "Customer Register",
    name: "Name", phoneNumber: "Phone Number",
    confirmPassword: "Confirm Password",
    selectGender: "Select your gender",
    male: "Male", female: "Female", other: "Other",
    preferredCompanionAny: "Preferred companion gender: Any",
    preferredCompanionMale: "Preferred companion gender: Male",
    preferredCompanionFemale: "Preferred companion gender: Female",
    alreadyHaveAccount: "Already have an account? ",

    // UserType
    whatTypeOfUser: "What Type Of User?",
    taxiDriver: "Taxi Driver", user: "User", admin: "Admin",

    // About
    aboutUsTitle: "About Us",
    aboutP1: "Travel Buddy was created to assist people in finding compatible travel companions based on their gender, present location, and preferred destination.",
    aboutP2: "Our live chat function allows consumers to interact instantly and easily organize their trips. For equitable and transparent cost sharing, we provide an all-in-one taxi booking service with automatic fare calculation.",
    aboutP3: "Travel Buddy contributes to lower air pollution and traffic congestion by encouraging ride-sharing as a safer, more economical, and environmentally friendly way to travel.",
    aboutP4: "Based in Oman, our platform builds a trusted community that makes travel easier, safer, and more sustainable—addressing local concerns about safety and high transportation costs.",

    // Search
    whereDoYouWantToGo: "Where do you want to go?",
    leavingFrom: "Leaving from", goingTo: "Going To",
    today: "Today", searchBtn: "Search",
    cancel: "Cancel", postYourTrip: "+ Post Your Trip",
    postATrip: "Post a Trip", from: "From", to: "To",
    date: "Date", time: "Time",
    maxCompanions: "Max Companions",
    companionGenderPref: "Companion Gender Preference",
    fareSetByDriver: "The fare will be set by the assigned taxi driver.",
    postTrip: "Post Trip", searching: "Searching...",
    noTripsFound: "No trips found matching your search.",
    yourTrip: "Your trip", connect: "Connect",
    findPerfectRide: "Find the perfect ride without breaking the bank",
    selectPlace: "Select place", any: "Any",
    maleOnly: "Male only", femaleOnly: "Female only",
    dateLabel: "Date", postedBy: "Posted by",

    // Feedback
    giveFeedback: "Give feedback",
    howWouldYouRate: "How would you rate your overall experience?",
    kindlyTellUs: "Kindly take a moment to tell us what you think",
    shareMyFeedback: "Share My Feedback",
    checkingEligibility: "Checking eligibility…",
    haveYouCompleted: "Have you completed the drive?",
    toLeaveFeedback: "To leave feedback, please first mark your trip as complete in My Bookings. Once completed, you can come back here to share your experience.",
    markMyTrip: "Yes, Mark My Trip as Complete",
    onlyAfterCompleting: "You can only leave feedback after completing a trip.",

    // MyBookings
    myBookingsTitle: "My Bookings",
    loadingBookings: "Loading bookings…",
    noBookingsYet: "You have no bookings yet.",
    findATrip: "Find a Trip",
    payYourShare: "💳 Pay Your Share",
    markAsComplete: "✅ Mark as Complete",
    marking: "Marking…",
    trackDriver: "📍 Track Driver",
    stopTracking: "🛑 Stop Tracking",
    leaveFeedbackBtn: "⭐ Leave Feedback",
    fetchingLocation: "Fetching driver location…",
    driverLocationNA: "Driver location not available yet.",
    totalFare: "Total Fare", farePerPerson: "Fare per person",
    bookingId: "Booking ID", bookedOn: "Booked on",
    participants: "Participants", driver: "Driver",
    vehicle: "Vehicle", plate: "Plate",
    tripDetailsUnavailable: "Trip details unavailable",

    // Payment Method
    continueForPayment: "Continue For Payment",
    card: "Card", cash: "Cash",

    // Card Payment
    nameOnCard: "Name on card", cardNumber: "Card number",
    expireDate: "Expire date", formatMMYY: "Format: MM/YY",
    securityCode: "Security code (cvv)", digits: "3 or 4 digits",
    pay: "Pay", back: "Back",
    paidSuccessfully: "Paid Successfully ✔",
    yourShare: "Your Share (50%)", escrowHold: "Escrow Hold (10%)",

    // Cash Payment
    cashPayment: "Cash Payment",
    handYourShare: "Please hand your share of",
    toTheDriver: "directly to the driver in cash.",
    platformWillHold: "The platform will hold",
    inEscrow: "in escrow until the trip is completed.",
    confirmCashPayment: "Confirm Cash Payment",
    cashConfirmed: "Cash payment confirmed ✔",
    leaveFeedbackCash: "Leave Feedback",

    // Notifications
    notificationsTitle: "🔔 Notifications",
    markAllRead: "Mark all read",
    clearAll: "Clear all", clearing: "Clearing…",
    noNotificationsYet: "No notifications yet.",

    // Forgot / Reset Password
    forgotPasswordTitle: "Forgot Password",
    sendResetLink: "Send Reset Link",
    resetPasswordTitle: "Reset Password",
    newPassword: "New Password",
    resetPasswordBtn: "Reset Password",

    // Admin Login
    adminLogin: "Admin Login",
    adminEmail: "Admin Email",
    adminPassword: "Admin Password",
    loggingIn2: "Logging in...",

    // Admin Dashboard
    adminDashboard: "Admin Dashboard",
    pendingDrivers: "Pending Drivers",
    verifiedDrivers: "Verified Drivers",
    suspendedDrivers: "Suspended Drivers",
    platformReports: "Platform Reports",
    sendNotification: "Send Notification",
    noPendingDrivers: "No pending drivers",
    noVerifiedDrivers: "No verified drivers",
    noSuspendedDrivers: "No suspended drivers",
    approve: "Approve",
    reject: "Reject",
    rejectionReason: "Rejection reason",
    removeAndNotify: "Remove & Notify",
    suspend: "Suspend",
    reinstate: "Reinstate",
    loadingDrivers: "Loading drivers...",
    loadingReports: "Loading reports…",
    loadReports: "Load Reports",
    totalUsers: "Total Users",
    totalDrivers: "Total Drivers",
    totalTrips: "Total Trips",
    totalBookings: "Total Bookings",
    totalRevenue: "Total Revenue (OMR)",
    avgRating: "Average Rating",
    totalFeedbacks: "Total Feedbacks",
    sendTo: "Send To",
    allUsers: "All Users",
    allDrivers: "All Drivers",
    specificEmail: "Specific Email",
    emailAddress2: "Email Address",
    notifTitle: "Title",
    notifMessage: "Message",
    notifTitlePlaceholder: "Notification title",
    notifBodyPlaceholder: "Write your message here...",
    sending: "Sending…",
    sendNotifBtn: "Send Notification",
    flaggedWarning: "⚠️ Flagged: More than 10 one-star reviews",
    driverName: "Name", driverEmail: "Email", driverPhone: "Phone",
    driverVehicle: "Vehicle", driverPlate: "Plate",
    driverLicense: "License", driverExp: "Experience",
    driverStatus: "Status", driverRejReason: "Rejection Reason",
    licensePdf: "License PDF", permitPdf: "Permit PDF",
    carRegPdf: "Car Registration PDF", viewLink: "View",
    yearsExp: "years",
    showFeedback: "Show Feedback",
    hideFeedback: "Hide Feedback",
    noFeedbackYet: "No feedback yet.",

    // Booking
    bookYourRide: "Book Your Ride",
    enterLocationsHint: "Enter your locations and pin them on the map.",
    startLocation: "Start Location",
    endLocation: "End Location",
    startLocationPlaceholder: "e.g. Muscat City Center",
    endLocationPlaceholder: "e.g. Sultan Qaboos University",
    saveLocations: "Save Locations",
    fillBothLocations: "Please fill in both locations.",
    savedSuccessfully: "Saved Successfully ✓",
    pinOnMap: "Pin on map",
    pickupPoint: "Pickup Point",
    dropoffPoint: "Drop-off Point",
    clickToPlacePin: "Click on the map to place the",

    // Change Password
    changePasswordTitle: "Change Password",
    currentPassword: "Current Password",
    changePasswordBtn: "Change Password",
    saving: "Saving…",
    passwordsMustMatch: "New passwords do not match.",
    passwordTooShort: "Password must be at least 6 characters.",
    passwordChangedSuccess: "Password changed successfully!",
    passwordChangeFailed: "Failed to change password.",
    changePassword: "Change Password",
    loading: "Loading...",

    // Footer
    copyright: "Travel Buddy 2026 ©",

    // Status labels
    statusPending: "Pending",
    statusConfirmed: "Confirmed",
    statusDriverReady: "Searching for Driver…",
    statusDriverAccepted: "Driver Assigned – Pay Now",
    statusCompleted: "Completed",
    statusPaid: "Paid",
  },

  ar: {
    // Nav
    home: "الرئيسية", search: "بحث", about: "من نحن", chat: "المحادثات",
    booking: "الحجز", feedback: "التقييم", myBookings: "حجوزاتي",
    login: "تسجيل الدخول", register: "إنشاء حساب", logout: "تسجيل الخروج",
    darkMode: "الوضع الداكن", lightMode: "الوضع الفاتح", dashboard: "لوحة التحكم",

    // Welcome
    welcome: "أهلاً وسهلاً !", getStarted: "ابدأ الآن",

    // Home
    lowPricesTitle: "اختر رحلتك بأسعار منخفضة",
    lowPricesText: "ابحث عن الرحلة المثالية من قائمتنا الواسعة من المواقع والمسارات بأسعار معقولة، سواء كنت تسافر بالحافلة أو بالسيارة المشتركة.",
    trustTitle: "ثق بمن تسافر معهم.",
    trustText: "نحرص على التعرف على شركائنا وأعضائنا. نتحقق من الهويات والمراجعات والملفات الشخصية حتى تتمكن من حجز رحلتك بثقة وأمان.",
    easyTitle: "تصفح، انقر، واضغط وانطلق!",
    easyText: "لم يكن حجز رحلة بهذه السهولة من قبل! بفضل برنامجنا السهل المدعوم بتقنية متقدمة، يمكنك جدولة رحلة قريبة منك في دقائق.",

    // Login
    loginTitle: "تسجيل الدخول", signUp: "إنشاء حساب",
    emailAddress: "البريد الإلكتروني", password: "كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟", loggingIn: "جارٍ تسجيل الدخول…",
    noDriverAccount: "ليس لديك حساب سائق؟ ", newHere: "مستخدم جديد؟ ",
    wrongCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", fillAllFields: "يرجى ملء جميع الحقول.",

    // Register
    customerRegister: "تسجيل مستخدم جديد",
    name: "الاسم", phoneNumber: "رقم الهاتف",
    confirmPassword: "تأكيد كلمة المرور",
    selectGender: "اختر جنسك",
    male: "ذكر", female: "أنثى", other: "آخر",
    preferredCompanionAny: "الجنس المفضل للرفيق: أي",
    preferredCompanionMale: "الجنس المفضل للرفيق: ذكر",
    preferredCompanionFemale: "الجنس المفضل للرفيق: أنثى",
    alreadyHaveAccount: "لديك حساب بالفعل؟ ",

    // UserType
    whatTypeOfUser: "ما نوع المستخدم؟",
    taxiDriver: "سائق تاكسي", user: "مستخدم", admin: "مشرف",

    // About
    aboutUsTitle: "من نحن",
    aboutP1: "تم إنشاء Travel Buddy لمساعدة الناس في إيجاد رفقاء سفر متوافقين بناءً على الجنس والموقع الحالي والوجهة المفضلة.",
    aboutP2: "تتيح ميزة الدردشة المباشرة للمستخدمين التواصل الفوري وتنظيم رحلاتهم بسهولة. نوفر خدمة حجز سيارات أجرة شاملة مع حساب تلقائي للأجرة لتقاسم عادل وشفاف للتكاليف.",
    aboutP3: "يساهم Travel Buddy في خفض تلوث الهواء والازدحام المروري من خلال تشجيع مشاركة الركوب كطريقة سفر أكثر أماناً واقتصاداً وصداقة للبيئة.",
    aboutP4: "منصتنا المتخصصة في عُمان تبني مجتمعاً موثوقاً يجعل السفر أسهل وأكثر أماناً واستدامة، معالجةً المخاوف المحلية بشأن السلامة وارتفاع تكاليف النقل.",

    // Search
    whereDoYouWantToGo: "إلى أين تريد الذهاب؟",
    leavingFrom: "المغادرة من", goingTo: "الوجهة",
    today: "اليوم", searchBtn: "بحث",
    cancel: "إلغاء", postYourTrip: "+ نشر رحلتك",
    postATrip: "نشر رحلة", from: "من", to: "إلى",
    date: "التاريخ", time: "الوقت",
    maxCompanions: "أقصى عدد للرفقاء",
    companionGenderPref: "تفضيل جنس الرفيق",
    fareSetByDriver: "سيتم تحديد الأجرة من قبل سائق التاكسي.",
    postTrip: "نشر الرحلة", searching: "جارٍ البحث...",
    noTripsFound: "لا توجد رحلات مطابقة.",
    yourTrip: "رحلتك", connect: "تواصل",
    findPerfectRide: "ابحث عن الرحلة المثالية دون إرهاق ميزانيتك",
    selectPlace: "اختر مكاناً", any: "أي",
    maleOnly: "ذكور فقط", femaleOnly: "إناث فقط",
    dateLabel: "التاريخ", postedBy: "نشر بواسطة",

    // Feedback
    giveFeedback: "تقديم تقييم",
    howWouldYouRate: "كيف تقيّم تجربتك الإجمالية؟",
    kindlyTellUs: "يُرجى مشاركتنا رأيك",
    shareMyFeedback: "مشاركة تقييمي",
    checkingEligibility: "جارٍ التحقق من الأهلية…",
    haveYouCompleted: "هل أتممت الرحلة؟",
    toLeaveFeedback: "لتقديم تقييم، يرجى أولاً تحديد رحلتك كمكتملة في حجوزاتي. بعد الاكتمال، يمكنك العودة هنا لمشاركة تجربتك.",
    markMyTrip: "نعم، سجّل رحلتي كمكتملة",
    onlyAfterCompleting: "يمكنك تقديم تقييم فقط بعد إتمام رحلة.",

    // MyBookings
    myBookingsTitle: "حجوزاتي",
    loadingBookings: "جارٍ تحميل الحجوزات…",
    noBookingsYet: "لا توجد حجوزات بعد.",
    findATrip: "ابحث عن رحلة",
    payYourShare: "💳 ادفع حصتك",
    markAsComplete: "✅ تحديد كمكتمل",
    marking: "جارٍ التحديد…",
    trackDriver: "📍 تتبع السائق",
    stopTracking: "🛑 إيقاف التتبع",
    leaveFeedbackBtn: "⭐ تقديم تقييم",
    fetchingLocation: "جارٍ تحديد موقع السائق…",
    driverLocationNA: "موقع السائق غير متاح حالياً.",
    totalFare: "إجمالي الأجرة", farePerPerson: "الأجرة للشخص",
    bookingId: "رقم الحجز", bookedOn: "تاريخ الحجز",
    participants: "المشاركون", driver: "السائق",
    vehicle: "المركبة", plate: "لوحة الترخيص",
    tripDetailsUnavailable: "تفاصيل الرحلة غير متاحة",

    // Payment Method
    continueForPayment: "المتابعة للدفع",
    card: "بطاقة", cash: "نقداً",

    // Card Payment
    nameOnCard: "الاسم على البطاقة", cardNumber: "رقم البطاقة",
    expireDate: "تاريخ الانتهاء", formatMMYY: "الصيغة: MM/YY",
    securityCode: "رمز الأمان (CVV)", digits: "3 أو 4 أرقام",
    pay: "ادفع", back: "رجوع",
    paidSuccessfully: "تم الدفع بنجاح ✔",
    yourShare: "حصتك (50%)", escrowHold: "احتياطي الضمان (10%)",

    // Cash Payment
    cashPayment: "الدفع النقدي",
    handYourShare: "يرجى تسليم حصتك البالغة",
    toTheDriver: "نقداً إلى السائق مباشرةً.",
    platformWillHold: "ستحتفظ المنصة بمبلغ",
    inEscrow: "في الضمان حتى اكتمال الرحلة.",
    confirmCashPayment: "تأكيد الدفع النقدي",
    cashConfirmed: "تم تأكيد الدفع النقدي ✔",
    leaveFeedbackCash: "تقديم تقييم",

    // Notifications
    notificationsTitle: "🔔 الإشعارات",
    markAllRead: "تحديد الكل كمقروء",
    clearAll: "مسح الكل", clearing: "جارٍ المسح…",
    noNotificationsYet: "لا توجد إشعارات بعد.",

    // Forgot / Reset Password
    forgotPasswordTitle: "نسيت كلمة المرور",
    sendResetLink: "إرسال رابط الاسترداد",
    resetPasswordTitle: "إعادة تعيين كلمة المرور",
    newPassword: "كلمة المرور الجديدة",
    resetPasswordBtn: "إعادة تعيين كلمة المرور",

    // Admin Login
    adminLogin: "تسجيل دخول المشرف",
    adminEmail: "البريد الإلكتروني للمشرف",
    adminPassword: "كلمة مرور المشرف",
    loggingIn2: "جارٍ تسجيل الدخول...",

    // Admin Dashboard
    adminDashboard: "لوحة تحكم المشرف",
    pendingDrivers: "السائقون المعلقون",
    verifiedDrivers: "السائقون المعتمدون",
    suspendedDrivers: "السائقون الموقوفون",
    platformReports: "تقارير المنصة",
    sendNotification: "إرسال إشعار",
    noPendingDrivers: "لا يوجد سائقون معلقون",
    noVerifiedDrivers: "لا يوجد سائقون معتمدون",
    noSuspendedDrivers: "لا يوجد سائقون موقوفون",
    approve: "موافقة",
    reject: "رفض",
    rejectionReason: "سبب الرفض",
    removeAndNotify: "إزالة وإشعار",
    suspend: "إيقاف",
    reinstate: "إعادة تفعيل",
    loadingDrivers: "جارٍ تحميل السائقين...",
    loadingReports: "جارٍ تحميل التقارير…",
    loadReports: "تحميل التقارير",
    totalUsers: "إجمالي المستخدمين",
    totalDrivers: "إجمالي السائقين",
    totalTrips: "إجمالي الرحلات",
    totalBookings: "إجمالي الحجوزات",
    totalRevenue: "إجمالي الإيرادات (OMR)",
    avgRating: "متوسط التقييم",
    totalFeedbacks: "إجمالي التقييمات",
    sendTo: "إرسال إلى",
    allUsers: "جميع المستخدمين",
    allDrivers: "جميع السائقين",
    specificEmail: "بريد إلكتروني محدد",
    emailAddress2: "البريد الإلكتروني",
    notifTitle: "العنوان",
    notifMessage: "الرسالة",
    notifTitlePlaceholder: "عنوان الإشعار",
    notifBodyPlaceholder: "اكتب رسالتك هنا...",
    sending: "جارٍ الإرسال…",
    sendNotifBtn: "إرسال الإشعار",
    flaggedWarning: "⚠️ مُبلَّغ عنه: أكثر من 10 تقييمات بنجمة واحدة",
    driverName: "الاسم", driverEmail: "البريد الإلكتروني", driverPhone: "الهاتف",
    driverVehicle: "المركبة", driverPlate: "لوحة الترخيص",
    driverLicense: "رخصة القيادة", driverExp: "الخبرة",
    driverStatus: "الحالة", driverRejReason: "سبب الرفض",
    licensePdf: "رخصة القيادة PDF", permitPdf: "تصريح PDF",
    carRegPdf: "تسجيل السيارة PDF", viewLink: "عرض",
    yearsExp: "سنوات",
    showFeedback: "عرض التقييمات",
    hideFeedback: "إخفاء التقييمات",
    noFeedbackYet: "لا توجد تقييمات بعد.",

    // Booking
    bookYourRide: "احجز رحلتك",
    enterLocationsHint: "أدخل مواقعك وضعها على الخريطة.",
    startLocation: "موقع الانطلاق",
    endLocation: "موقع الوصول",
    startLocationPlaceholder: "مثال: مركز مسقط",
    endLocationPlaceholder: "مثال: جامعة السلطان قابوس",
    saveLocations: "حفظ المواقع",
    fillBothLocations: "يرجى ملء كلا الموقعين.",
    savedSuccessfully: "تم الحفظ بنجاح ✓",
    pinOnMap: "تحديد على الخريطة",
    pickupPoint: "نقطة الاستلام",
    dropoffPoint: "نقطة التوصيل",
    clickToPlacePin: "انقر على الخريطة لتحديد",

    // Change Password
    changePasswordTitle: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    changePasswordBtn: "تغيير كلمة المرور",
    saving: "جارٍ الحفظ…",
    passwordsMustMatch: "كلمتا المرور الجديدتان غير متطابقتين.",
    passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
    passwordChangedSuccess: "تم تغيير كلمة المرور بنجاح!",
    passwordChangeFailed: "فشل تغيير كلمة المرور.",
    changePassword: "تغيير كلمة المرور",
    loading: "جارٍ التحميل...",

    // Footer
    copyright: "تراڤل بادي 2026 ©",

    // Status labels
    statusPending: "قيد الانتظار",
    statusConfirmed: "مؤكد",
    statusDriverReady: "البحث عن سائق…",
    statusDriverAccepted: "تم تعيين السائق – ادفع الآن",
    statusCompleted: "مكتمل",
    statusPaid: "مدفوع",
  },
};

const LangContext = createContext({
  lang: "en",
  t: (key) => key,
  toggleLang: () => {},
});

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("tb_lang") || "en";
    document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = saved;
    return saved;
  });

  const toggleLang = () => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
    localStorage.setItem("tb_lang", next);
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = next;
  };

  const t = (key) => translations[lang][key] || translations["en"][key] || key;

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
