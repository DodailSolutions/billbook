/**
 * Translation strings for all supported languages
 */

import type { SupportedLanguage } from './languages'

export interface Translations {
  // Common
  common: {
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    search: string
    filter: string
    export: string
    download: string
    share: string
    print: string
    loading: string
    error: string
    success: string
    yes: string
    no: string
    ok: string
    back: string
    next: string
    previous: string
    submit: string
    close: string
  }
  
  // Navigation
  nav: {
    dashboard: string
    invoices: string
    customers: string
    products: string
    reports: string
    settings: string
    help: string
  }
  
  // Invoice
  invoice: {
    title: string
    createNew: string
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    customer: string
    items: string
    subtotal: string
    gst: string
    total: string
    amountDue: string
    paid: string
    unpaid: string
    overdue: string
    status: string
    draft: string
    sent: string
  }
  
  // Customer
  customer: {
    name: string
    email: string
    phone: string
    address: string
    gstin: string
    addCustomer: string
    editCustomer: string
  }
  
  // Messages
  messages: {
    invoiceCreated: string
    invoiceSaved: string
    invoiceDeleted: string
    customerAdded: string
    errorOccurred: string
  }
  
  // Invoice Template
  template: {
    to: string
    billTo: string
    from: string
    billFrom: string
    description: string
    quantity: string
    rate: string
    amount: string
    taxableAmount: string
    cgst: string
    sgst: string
    igst: string
    totalAmount: string
    amountInWords: string
    termsAndConditions: string
    bankDetails: string
    signature: string
  }
}

export const translations: Record<SupportedLanguage, Translations> = {
  // English
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      download: 'Download',
      share: 'Share',
      print: 'Print',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      close: 'Close'
    },
    nav: {
      dashboard: 'Dashboard',
      invoices: 'Invoices',
      customers: 'Customers',
      products: 'Products',
      reports: 'Reports',
      settings: 'Settings',
      help: 'Help'
    },
    invoice: {
      title: 'Invoice',
      createNew: 'Create New Invoice',
      invoiceNumber: 'Invoice Number',
      invoiceDate: 'Invoice Date',
      dueDate: 'Due Date',
      customer: 'Customer',
      items: 'Items',
      subtotal: 'Subtotal',
      gst: 'GST',
      total: 'Total',
      amountDue: 'Amount Due',
      paid: 'Paid',
      unpaid: 'Unpaid',
      overdue: 'Overdue',
      status: 'Status',
      draft: 'Draft',
      sent: 'Sent'
    },
    customer: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      gstin: 'GSTIN',
      addCustomer: 'Add Customer',
      editCustomer: 'Edit Customer'
    },
    messages: {
      invoiceCreated: 'Invoice created successfully',
      invoiceSaved: 'Invoice saved successfully',
      invoiceDeleted: 'Invoice deleted successfully',
      customerAdded: 'Customer added successfully',
      errorOccurred: 'An error occurred'
    },
    template: {
      to: 'To',
      billTo: 'Bill To',
      from: 'From',
      billFrom: 'Bill From',
      description: 'Description',
      quantity: 'Qty',
      rate: 'Rate',
      amount: 'Amount',
      taxableAmount: 'Taxable Amount',
      cgst: 'CGST',
      sgst: 'SGST',
      igst: 'IGST',
      totalAmount: 'Total Amount',
      amountInWords: 'Amount in Words',
      termsAndConditions: 'Terms and Conditions',
      bankDetails: 'Bank Details',
      signature: 'Signature'
    }
  },
  
  // Hindi
  hi: {
    common: {
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      add: 'जोड़ें',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      export: 'निर्यात',
      download: 'डाउनलोड',
      share: 'साझा करें',
      print: 'प्रिंट',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      yes: 'हाँ',
      no: 'नहीं',
      ok: 'ठीक है',
      back: 'पीछे',
      next: 'अगला',
      previous: 'पिछला',
      submit: 'जमा करें',
      close: 'बंद करें'
    },
    nav: {
      dashboard: 'डैशबोर्ड',
      invoices: 'बीजक',
      customers: 'ग्राहक',
      products: 'उत्पाद',
      reports: 'रिपोर्ट',
      settings: 'सेटिंग्स',
      help: 'सहायता'
    },
    invoice: {
      title: 'बीजक',
      createNew: 'नया बीजक बनाएं',
      invoiceNumber: 'बीजक संख्या',
      invoiceDate: 'बीजक तिथि',
      dueDate: 'देय तिथि',
      customer: 'ग्राहक',
      items: 'वस्तुएं',
      subtotal: 'उप-योग',
      gst: 'जीएसटी',
      total: 'कुल',
      amountDue: 'देय राशि',
      paid: 'भुगतान किया गया',
      unpaid: 'अवैतनिक',
      overdue: 'अतिदेय',
      status: 'स्थिति',
      draft: 'मसौदा',
      sent: 'भेजा गया'
    },
    customer: {
      name: 'नाम',
      email: 'ईमेल',
      phone: 'फोन',
      address: 'पता',
      gstin: 'जीएसटीआईएन',
      addCustomer: 'ग्राहक जोड़ें',
      editCustomer: 'ग्राहक संपादित करें'
    },
    messages: {
      invoiceCreated: 'बीजक सफलतापूर्वक बनाया गया',
      invoiceSaved: 'बीजक सफलतापूर्वक सहेजा गया',
      invoiceDeleted: 'बीजक सफलतापूर्वक हटाया गया',
      customerAdded: 'ग्राहक सफलतापूर्वक जोड़ा गया',
      errorOccurred: 'एक त्रुटि हुई'
    },
    template: {
      to: 'प्रति',
      billTo: 'बिल प्रति',
      from: 'से',
      billFrom: 'बिल से',
      description: 'विवरण',
      quantity: 'मात्रा',
      rate: 'दर',
      amount: 'राशि',
      taxableAmount: 'कर योग्य राशि',
      cgst: 'सीजीएसटी',
      sgst: 'एसजीएसटी',
      igst: 'आईजीएसटी',
      totalAmount: 'कुल राशि',
      amountInWords: 'शब्दों में राशि',
      termsAndConditions: 'नियम और शर्तें',
      bankDetails: 'बैंक विवरण',
      signature: 'हस्ताक्षर'
    }
  },
  
  // Telugu
  te: {
    common: {
      save: 'సేవ్ చేయండి',
      cancel: 'రద్దు చేయండి',
      delete: 'తొలగించండి',
      edit: 'సవరించండి',
      add: 'జోడించండి',
      search: 'వెతకండి',
      filter: 'ఫిల్టర్',
      export: 'ఎగుమతి',
      download: 'డౌన్‌లోడ్',
      share: 'షేర్ చేయండి',
      print: 'ప్రింట్',
      loading: 'లోడ్ అవుతోంది...',
      error: 'లోపం',
      success: 'విజయం',
      yes: 'అవును',
      no: 'కాదు',
      ok: 'సరే',
      back: 'వెనుకకు',
      next: 'తదుపరి',
      previous: 'మునుపటి',
      submit: 'సమర్పించండి',
      close: 'మూసివేయండి'
    },
    nav: {
      dashboard: 'డాష్‌బోర్డ్',
      invoices: 'ఇన్వాయిస్‌లు',
      customers: 'కస్టమర్‌లు',
      products: 'ఉత్పత్తులు',
      reports: 'నివేదికలు',
      settings: 'సెట్టింగ్‌లు',
      help: 'సహాయం'
    },
    invoice: {
      title: 'ఇన్వాయిస్',
      createNew: 'కొత్త ఇన్వాయిస్ సృష్టించండి',
      invoiceNumber: 'ఇన్వాయిస్ నంబర్',
      invoiceDate: 'ఇన్వాయిస్ తేదీ',
      dueDate: 'గడువు తేదీ',
      customer: 'కస్టమర్',
      items: 'వస్తువులు',
      subtotal: 'ఉప మొత్తం',
      gst: 'జీఎస్టీ',
      total: 'మొత్తం',
      amountDue: 'చెల్లించవలసిన మొత్తం',
      paid: 'చెల్లించబడింది',
      unpaid: 'చెల్లించబడలేదు',
      overdue: 'గడువు దాటిపోయింది',
      status: 'స్థితి',
      draft: 'డ్రాఫ్ట్',
      sent: 'పంపబడింది'
    },
    customer: {
      name: 'పేరు',
      email: 'ఇమెయిల్',
      phone: 'ఫోన్',
      address: 'చిరునామా',
      gstin: 'జీఎస్టీఐఎన్',
      addCustomer: 'కస్టమర్‌ను జోడించండి',
      editCustomer: 'కస్టమర్‌ను సవరించండి'
    },
    messages: {
      invoiceCreated: 'ఇన్వాయిస్ విజయవంతంగా సృష్టించబడింది',
      invoiceSaved: 'ఇన్వాయిస్ విజయవంతంగా సేవ్ చేయబడింది',
      invoiceDeleted: 'ఇన్వాయిస్ విజయవంతంగా తొలగించబడింది',
      customerAdded: 'కస్టమర్ విజయవంతంగా జోడించబడింది',
      errorOccurred: 'ఒక లోపం సంభవించింది'
    },
    template: {
      to: 'కు',
      billTo: 'బిల్ కు',
      from: 'నుండి',
      billFrom: 'బిల్ నుండి',
      description: 'వివరణ',
      quantity: 'పరిమాణం',
      rate: 'రేటు',
      amount: 'మొత్తం',
      taxableAmount: 'పన్ను విధించదగిన మొత్తం',
      cgst: 'సీజీఎస్టీ',
      sgst: 'ఎస్జీఎస్టీ',
      igst: 'ఐజీఎస్టీ',
      totalAmount: 'మొత్తం మొత్తం',
      amountInWords: 'మొత్తం మాటల్లో',
      termsAndConditions: 'నియమాలు మరియు షరతులు',
      bankDetails: 'బ్యాంక్ వివరాలు',
      signature: 'సంతకం'
    }
  },
  
  // Tamil
  ta: {
    common: {
      save: 'சேமிக்கவும்',
      cancel: 'ரத்து செய்',
      delete: 'நீக்கு',
      edit: 'திருத்து',
      add: 'சேர்',
      search: 'தேடு',
      filter: 'வடிகட்டி',
      export: 'ஏற்றுமதி',
      download: 'பதிவிறக்கு',
      share: 'பகிர்',
      print: 'அச்சிடு',
      loading: 'ஏற்றுகிறது...',
      error: 'பிழை',
      success: 'வெற்றி',
      yes: 'ஆம்',
      no: 'இல்லை',
      ok: 'சரி',
      back: 'பின்',
      next: 'அடுத்து',
      previous: 'முந்தைய',
      submit: 'சமர்ப்பி',
      close: 'மூடு'
    },
    nav: {
      dashboard: 'டாஷ்போர்டு',
      invoices: 'விலைப்பட்டியல்கள்',
      customers: 'வாடிக்கையாளர்கள்',
      products: 'தயாரிப்புகள்',
      reports: 'அறிக்கைகள்',
      settings: 'அமைப்புகள்',
      help: 'உதவி'
    },
    invoice: {
      title: 'விலைப்பட்டியல்',
      createNew: 'புதிய விலைப்பட்டியல் உருவாக்கு',
      invoiceNumber: 'விலைப்பட்டியல் எண்',
      invoiceDate: 'விலைப்பட்டியல் தேதி',
      dueDate: 'செலுத்த வேண்டிய தேதி',
      customer: 'வாடிக்கையாளர்',
      items: 'பொருட்கள்',
      subtotal: 'துணை மொத்தம்',
      gst: 'ஜிஎஸ்டி',
      total: 'மொத்தம்',
      amountDue: 'செலுத்த வேண்டிய தொகை',
      paid: 'செலுத்தப்பட்டது',
      unpaid: 'செலுத்தப்படவில்லை',
      overdue: 'காலாவதியானது',
      status: 'நிலை',
      draft: 'வரைவு',
      sent: 'அனுப்பப்பட்டது'
    },
    customer: {
      name: 'பெயர்',
      email: 'மின்னஞ்சல்',
      phone: 'தொலைபேசி',
      address: 'முகவரி',
      gstin: 'ஜிஎஸ்டிஐஎன்',
      addCustomer: 'வாடிக்கையாளரைச் சேர்',
      editCustomer: 'வாடிக்கையாளரைத் திருத்து'
    },
    messages: {
      invoiceCreated: 'விலைப்பட்டியல் வெற்றிகரமாக உருவாக்கப்பட்டது',
      invoiceSaved: 'விலைப்பட்டியல் வெற்றிகரமாக சேமிக்கப்பட்டது',
      invoiceDeleted: 'விலைப்பட்டியல் வெற்றிகரமாக நீக்கப்பட்டது',
      customerAdded: 'வாடிக்கையாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      errorOccurred: 'ஒரு பிழை ஏற்பட்டது'
    },
    template: {
      to: 'வரை',
      billTo: 'பில் வரை',
      from: 'இருந்து',
      billFrom: 'பில் இருந்து',
      description: 'விளக்கம்',
      quantity: 'அளவு',
      rate: 'விகிதம்',
      amount: 'தொகை',
      taxableAmount: 'வரி விதிக்கக்கூடிய தொகை',
      cgst: 'சிஜிஎஸ்டி',
      sgst: 'எஸ்ஜிஎஸ்டி',
      igst: 'ஐஜிஎஸ்டி',
      totalAmount: 'மொத்த தொகை',
      amountInWords: 'வார்த்தைகளில் தொகை',
      termsAndConditions: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
      bankDetails: 'வங்கி விவரங்கள்',
      signature: 'கையொப்பம்'
    }
  }
}

/**
 * Get translation by key
 */
export function t(
  language: SupportedLanguage,
  key: string
): string {
  const keys = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[language]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key
}

/**
 * Convert number to words (for invoice amounts)
 */
export function numberToWords(num: number, language: SupportedLanguage): string {
  if (language === 'en') {
    return numberToWordsEnglish(num)
  }
  if (language === 'hi') {
    return numberToWordsHindi(num)
  }
  if (language === 'te') {
    return numberToWordsTelugu(num)
  }
  if (language === 'ta') {
    return numberToWordsTamil(num)
  }
  return numberToWordsEnglish(num)
}

function numberToWordsEnglish(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  if (num === 0) return 'Zero Rupees Only'
  
  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = Math.floor((num % 1000) / 100)
  const remainder = num % 100
  
  let words = ''
  
  if (crore > 0) words += convertToWords(crore) + ' Crore '
  if (lakh > 0) words += convertToWords(lakh) + ' Lakh '
  if (thousand > 0) words += convertToWords(thousand) + ' Thousand '
  if (hundred > 0) words += ones[hundred] + ' Hundred '
  if (remainder > 0) {
    if (remainder < 10) words += ones[remainder]
    else if (remainder < 20) words += teens[remainder - 10]
    else {
      words += tens[Math.floor(remainder / 10)]
      if (remainder % 10 > 0) words += ' ' + ones[remainder % 10]
    }
  }
  
  return words.trim() + ' Rupees Only'
  
  function convertToWords(n: number): string {
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    return tens[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' + ones[n % 10] : '')
  }
}

function numberToWordsHindi(num: number): string {
  // Simplified Hindi number to words
  return `${num} रुपये मात्र`
}

function numberToWordsTelugu(num: number): string {
  // Simplified Telugu number to words
  return `${num} రూపాయలు మాత్రమే`
}

function numberToWordsTamil(num: number): string {
  // Simplified Tamil number to words
  return `${num} ரூபாய் மட்டும்`
}
