// UI strings shared by the portals and online services: [English, Hindi, Marathi]. `{name}` placeholders are filled
// in by t(key, params). Hindi and Marathi wording should be reviewed by MGIMS before go-live.
export type Triple = [string, string, string];

export const commonStrings = {
  'common.cancel': ['Cancel', 'रद्द करें', 'रद्द करा'],
  'common.fix_errors': ['Please fix the following', 'कृपया इन्हें ठीक करें', 'कृपया खालील दुरुस्त करा'],
  'common.load_error': ['This could not be loaded. Please try again.', 'यह लोड नहीं हो सका। कृपया फिर से कोशिश करें।', 'हे लोड झाले नाही. कृपया पुन्हा प्रयत्न करा.'],
  'common.new_tab': ['(opens in a new tab)', '(नए टैब में खुलता है)', '(नवीन टॅबमध्ये उघडते)'],
  'common.no': ['No', 'नहीं', 'नाही'],
  'common.please_wait': ['Please wait…', 'कृपया प्रतीक्षा करें…', 'कृपया थांबा…'],
  'common.privacy_policy': ['Privacy Policy', 'गोपनीयता नीति', 'गोपनीयता धोरण'],
  'common.retry': ['Try again', 'फिर से कोशिश करें', 'पुन्हा प्रयत्न करा'],
  'common.service_error': ['The service is not reachable right now. Please try again in a few minutes.', 'सेवा अभी उपलब्ध नहीं है। कृपया कुछ मिनट बाद फिर से कोशिश करें।', 'सेवा सध्या उपलब्ध नाही. कृपया काही मिनिटांनी पुन्हा प्रयत्न करा.'],
  'common.yes': ['Yes', 'हाँ', 'होय'],

  'demo.title': ['Demo mode.', 'डेमो मोड।', 'डेमो मोड.'],
  'demo.body': [
    'The records here are fictional examples kept in this browser. Nothing is sent to the hospital or the college, and no money is charged.',
    'यहाँ दिखाए गए रिकॉर्ड काल्पनिक उदाहरण हैं जो इसी ब्राउज़र में रखे गए हैं। अस्पताल या कॉलेज को कुछ नहीं भेजा जाता और कोई पैसा नहीं लिया जाता।',
    'येथील नोंदी काल्पनिक उदाहरणे आहेत आणि याच ब्राउझरमध्ये ठेवल्या आहेत. रुग्णालय किंवा महाविद्यालयाला काहीही पाठवले जात नाही आणि पैसे घेतले जात नाहीत.',
  ],

  'fresh.stale': ['The live source is not responding. Showing the copy from {time}.', 'मूल स्रोत अभी जवाब नहीं दे रहा है। {time} की प्रति दिखाई जा रही है।', 'मूळ स्रोत सध्या प्रतिसाद देत नाही. {time} ची प्रत दाखवत आहोत.'],
  'fresh.updated': ['Updated {time}', 'अद्यतन: {time}', 'अद्ययावत: {time}'],
  'fresh.updated_from': ['Updated {time} from {source}', '{source} से अद्यतन: {time}', '{source} कडून अद्ययावत: {time}'],


  'listen.start': ['Listen to this page', 'यह पेज सुनें', 'हे पान ऐका'],
  'listen.stop': ['Stop reading', 'पढ़ना बंद करें', 'वाचन थांबवा'],



  'nf.code': ['Error 404', 'त्रुटि 404', 'त्रुटी 404'],
  'nf.title': ['Page not found', 'पेज नहीं मिला', 'पान सापडले नाही'],
  'nf.body': [
    'There is no page at this address. It may have moved when the website was renewed. Search for it, or choose a page below.',
    'इस पते पर कोई पेज नहीं है। वेबसाइट के नवीनीकरण में यह स्थानांतरित हो सकता है। इसे खोजें या नीचे से कोई पेज चुनें।',
    'या पत्त्यावर कोणतेही पान नाही. संकेतस्थळ नूतनीकरणात ते हलले असेल. ते शोधा किंवा खालील पान निवडा.',
  ],
  'nf.popular': ['Popular pages', 'लोकप्रिय पेज', 'लोकप्रिय पाने'],
  'nf.opd': ['OPD timings and departments', 'ओपीडी समय और विभाग', 'ओपीडी वेळा आणि विभाग'],
  'nf.admissions': ['Admissions', 'प्रवेश', 'प्रवेश'],

  'sitemap.title': ['Sitemap', 'साइटमैप', 'साइटमॅप'],
  'sitemap.intro': ['Every section of the website on one page.', 'वेबसाइट के सभी अनुभाग एक पेज पर।', 'संकेतस्थळाचे सर्व विभाग एकाच पानावर.'],
  'help.title': ['Help', 'सहायता', 'मदत'],
  'help.intro': ['How to find information, change the display, and use the online services.', 'जानकारी कैसे खोजें, प्रदर्शन कैसे बदलें और ऑनलाइन सेवाओं का उपयोग कैसे करें।', 'माहिती कशी शोधावी, दर्शन कसे बदलावे आणि ऑनलाइन सेवा कशा वापराव्यात.'],
  'a11y.title': ['Accessibility statement', 'सुगम्यता विवरण', 'सुलभता निवेदन'],
  'a11y.intro': ['What this website does to be usable by everyone, its known limits, and how to report a problem.', 'यह वेबसाइट सभी के लिए उपयोगी होने के लिए क्या करती है, इसकी ज्ञात सीमाएँ, और समस्या कैसे बताएँ।', 'हे संकेतस्थळ सर्वांना वापरता यावे यासाठी काय करते, त्याच्या ज्ञात मर्यादा आणि समस्या कशी कळवावी.'],
  'error.title': ['Something went wrong on this page', 'इस पेज पर कुछ गड़बड़ हो गई', 'या पानावर काहीतरी चूक झाली'],
  'error.body': [
    'The rest of the website still works. Try again, or go to another page.',
    'वेबसाइट का बाकी हिस्सा काम कर रहा है। फिर से प्रयास करें या किसी अन्य पेज पर जाएँ।',
    'वेबसाइटचा उर्वरित भाग चालू आहे. पुन्हा प्रयत्न करा किंवा दुसऱ्या पानावर जा.',
  ],
  'error.updated_title': ['A new version of the website is available', 'वेबसाइट का नया संस्करण उपलब्ध है', 'वेबसाइटची नवीन आवृत्ती उपलब्ध आहे'],
  'error.updated_body': ['Reload the page to continue.', 'जारी रखने के लिए पेज फिर से लोड करें।', 'पुढे जाण्यासाठी पान पुन्हा लोड करा.'],
  'error.retry': ['Try again', 'फिर से प्रयास करें', 'पुन्हा प्रयत्न करा'],
  'error.reload': ['Reload the page', 'पेज फिर से लोड करें', 'पान पुन्हा लोड करा'],
  'error.home': ['Go to the home page', 'होम पेज पर जाएँ', 'मुख्य पानावर जा'],
  // Shared form labels and messages.
  'form.name': ['Full name', 'पूरा नाम', 'पूर्ण नाव'],
  'form.email': ['Email address', 'ईमेल पता', 'ईमेल पत्ता'],
  'form.error.name': ['Enter the full name.', 'पूरा नाम दर्ज करें।', 'पूर्ण नाव टाका.'],
  'form.error.email': ['Enter an email like name@example.com.', 'name@example.com जैसा ईमेल दर्ज करें।', 'name@example.com सारखा ईमेल टाका.'],
  'form.error.mobile': [
    'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.',
    '6, 7, 8 या 9 से शुरू होने वाला 10 अंकों का मोबाइल नंबर दर्ज करें।',
    '6, 7, 8 किंवा 9 ने सुरू होणारा 10 अंकी मोबाइल क्रमांक टाका.',
  ],
  'news.language': ['Language for messages', 'संदेशों की भाषा', 'संदेशांची भाषा'],
} satisfies Record<string, Triple>;
