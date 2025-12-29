import { validateWebhookUrl } from '../utils/validation';
interface IntegrationSettings {
  makeWebhook: string;
}

/**
 * Retrieves the configured Webhook URL from LocalStorage.
 */
const getWebhookUrl = (): string | null => {
  const savedIntegrations = localStorage.getItem('lumina_settings_integrations');
  if (!savedIntegrations) return null;

  const settings: IntegrationSettings = JSON.parse(savedIntegrations);
  const url = settings.makeWebhook?.trim();

  if (!url) return null;

  // Validazione URL
  if (!validateWebhookUrl(url)) {
    console.error('❌ Webhook URL non valido:', url);
    return null;
  }

  return url;
};

/**
 * Generic function to send data payload to the configured Make.com Webhook.
 */
const sendToMake = async (eventType: string, payload: any) => {
  const url = getWebhookUrl();

  // Always log for debugging visibility
  console.log(`[Lumina Integration] Event: ${eventType}`, payload);

  if (!url) {
    // If no URL is set, we warn but don't block the UI flow completely (fail gracefully)
    console.warn(`Make.com Webhook URL not configured. Event '${eventType}' saved locally only.`);
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventType,
        source: 'Lumina Web App',
        timestamp: new Date().toISOString(),
        data: payload
      }),
    });

    if (response.ok) {
      console.log(`[Lumina Integration] ✅ Successfully sent to Make.`);
      return true;
    } else {
      console.error(`[Lumina Integration] ❌ Server error: ${response.status}`);
      alert(`⚠️ Errore sincronizzazione Make.com\n\nEvento: ${eventType}\nStatus: ${response.status}\n\nVerifica webhook URL in Settings.`);
      return false;
    }
  } catch (error) {
    console.error("Integration Error:", error);
    alert(`❌ Impossibile connettersi a Make.com\n\nEvento: ${eventType}\nErrore: ${error instanceof Error ? error.message : String(error)}\n\nVerifica:\n1. Webhook URL corretto in Settings\n2. Connessione internet attiva\n3. Make.com scenario attivo`);
    return false;
  }
};

/**
 * Fetches all clients from Google Sheets via Make.com webhook
 */
export const fetchClientsFromSheets = async (): Promise<any[]> => {
  const url = getWebhookUrl();

  if (!url) {
    console.warn('⚠️ Make.com Webhook URL not configured. Cannot fetch clients from Sheets.');
    return [];
  }

  try {
    console.log('[Lumina Integration] 📥 Fetching clients from Google Sheets...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'GET_CLIENTS',
        source: 'Lumina Web App',
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error(`[Lumina Integration] ❌ Failed to fetch clients: ${response.status}`);
      return [];
    }

    const text = await response.text();
    console.log('[Lumina Integration] 📄 Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[Lumina Integration] ❌ JSON Parse Error:', e);
      return [];
    }

    if (data.success && Array.isArray(data.clients)) {
      console.log(`[Lumina Integration] ✅ Loaded ${data.clients.length} clients from Sheets`);
      return data.clients;
    } else {
      console.warn('[Lumina Integration] ⚠️ Invalid response format from Make.com');
      return [];
    }
  } catch (error) {
    console.error('[Lumina Integration] ❌ Error fetching clients:', error);
    return [];
  }
};

// Fetch Sessions from Google Sheets
export const fetchSessionsFromSheets = async (): Promise<any[]> => {
  const url = localStorage.getItem('webhookUrl');

  if (!url) {
    console.warn('[Lumina Integration] ⚠️ No webhook URL configured');
    return [];
  }

  try {
    console.log('[Lumina Integration] 📥 Fetching sessions from Google Sheets...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'GET_SESSIONS',
        source: 'Lumina Web App',
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.error(`[Lumina Integration] ❌ Failed to fetch sessions: ${response.status}`);
      return [];
    }

    const text = await response.text();
    console.log('[Lumina Integration] 📄 Raw response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[Lumina Integration] ❌ JSON Parse Error:', e);
      return [];
    }

    if (data.success && Array.isArray(data.sessions)) {
      console.log(`[Lumina Integration] ✅ Loaded ${data.sessions.length} sessions from Sheets`);
      return data.sessions;
    } else {
      console.warn('[Lumina Integration] ⚠️ Invalid response format from Make.com');
      return [];
    }
  } catch (error) {
    console.error('[Lumina Integration] ❌ Error fetching sessions:', error);
    return [];
  }
};

// --- Specific Sync Functions ---

// 1. Clients
export const syncClient = async (client: any) => {
  return sendToMake('UPDATE_CLIENT_PROFILE', {
    id: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
    profession: client.profession,
    instagram: client.instagram,
    birthday: client.birthday,
    address: client.address,
    source: client.source,
    updatedAt: new Date().toISOString()
  });
};

// 2. Appointments / Sessions
export const syncSession = async (session: any) => {
  // Parse the date properly - ensure we preserve the user's local time
  const startTime = new Date(session.date);
  const durationHours = session.duration || 1;
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  // Format dates for Google Calendar with explicit timezone (Europe/Rome = GMT+1)
  // Using RFC3339 format: YYYY-MM-DDTHH:mm:ss+01:00
  const formatForGoogleCalendar = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Europe/Rome timezone (GMT+1 in winter, GMT+2 in summer)
    // For simplicity, using +01:00. Google Calendar will handle DST.
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+01:00`;
  };

  return sendToMake('NEW_SESSION', {
    id: session.id || Math.random().toString(36).substr(2, 9),
    title: session.title,
    client: session.clientName,
    email: session.clientEmail, // Required by Make.com (Gmail module)
    clientEmail: session.clientEmail, // Critical for Calendar Invite
    clientPhone: session.clientPhone, // Critical for WhatsApp
    serviceId: session.programId,
    category: session.category,
    startTime: formatForGoogleCalendar(startTime),
    endTime: formatForGoogleCalendar(endTime),
    durationHours: durationHours,
    price: session.price,
    notes: session.notes,
    googleCalendarSync: true // Flag to tell Make to create GCal event
  });
};

// 3. Finance (Invoices, Receipts, Expenses)
export const syncTransaction = async (transaction: any) => {
  return sendToMake('NEW_TRANSACTION', {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    currency: 'EUR',
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    paymentMethod: transaction.paymentMethod
  });
};

// 4. Batch Booking (from Client Profile)
// Combines session + transaction + client update into 1 API call
// to avoid 429 rate limit and save Make.com operations
export const syncBookingBatch = async (data: {
  session: any;
  transaction?: any;
  clientUpdate: any;
}) => {
  return sendToMake('BOOK_SESSION_BATCH', {
    session: {
      id: data.session.id || Math.random().toString(36).substr(2, 9),
      title: data.session.title,
      clientName: data.session.clientName,
      clientEmail: data.session.clientEmail,
      clientPhone: data.session.clientPhone,
      serviceId: data.session.programId,
      category: data.session.category,
      startTime: data.session.startTime,
      endTime: data.session.endTime,
      durationHours: data.session.duration,
      price: data.session.price,
      notes: data.session.notes
    },
    transaction: data.transaction ? {
      id: Math.random().toString(36).substr(2, 9),
      type: data.transaction.type,
      amount: data.transaction.amount,
      category: data.transaction.category,
      description: data.transaction.description,
      date: data.transaction.date,
      paymentMethod: data.transaction.paymentMethod || 'Credit Card'
    } : null,
    clientUpdate: {
      id: data.clientUpdate.id,
      totalSessions: data.clientUpdate.totalSessions,
      totalSpend: data.clientUpdate.totalSpend,
      loyaltyPoints: data.clientUpdate.loyaltyPoints,
      lastSession: data.clientUpdate.lastSession
    }
  });
};

// Sync transaction to Google Sheets for persistence
export const syncTransactionToSheets = async (transaction: any) => {
  return sendToMake('SAVE_TRANSACTION', {
    id: transaction.id,
    description: transaction.description,
    amount: transaction.amount,
    type: transaction.type,
    category: transaction.category,
    date: transaction.date,
    status: transaction.status,
    paymentMethod: transaction.paymentMethod
  });
};


export const sendReceiptEmail = async (transaction: any, clientEmail: string) => {
  return sendToMake('SEND_RECEIPT', {
    transactionId: transaction.id,
    amount: transaction.amount,
    date: transaction.date,
    recipient: transaction.description,
    clientEmail: clientEmail // Added for Gmail mapping
  });
};

// 4. Resources / Library
export const shareResource = async (resource: any, clientName: string, message: string, method: string, recipientPhone?: string) => {
  return sendToMake('SHARE_RESOURCE', {
    resourceTitle: resource.title,
    resourceType: resource.type,
    resourceUrl: resource.url,
    clientName: clientName,
    recipientPhone: recipientPhone,
    message: message,
    deliveryMethod: method,
    strategy: method === 'upsell' ? 'Sale' : 'Free Value'
  });
};

// 5. Company / Admin Profile (New)
export const syncCompanyProfile = async (profile: any) => {
  return sendToMake('UPDATE_COMPANY_PROFILE', {
    adminName: profile.name,
    companyName: profile.companyName,
    address: profile.companyAddress,
    vatId: profile.vatId,
    email: profile.email,
    phone: profile.phone,
    website: profile.website
  });
};

// 6. Programs / Services (New)
export const syncProgram = async (program: any) => {
  return sendToMake('UPDATE_PROGRAM', {
    id: program.id,
    title: program.title,
    category: program.category,
    type: program.type,
    price: program.price,
    duration: program.durationMinutes,
    active: program.active
  });
};

// 7. Gifts / Promos (New)
export const sendPromo = async (client: any, offerName: string, message: string) => {
  return sendToMake('SEND_PROMO', {
    clientId: client.id,
    clientName: `${client.firstName} ${client.lastName}`,
    clientEmail: client.email,
    offer: offerName,
    personalMessage: message,
    date: new Date().toISOString()
  });
};

// 8. Payroll Batch (New)
export const syncPayrollBatch = async (items: any[]) => {
  return sendToMake('PROCESS_PAYROLL', {
    count: items.length,
    totalAmount: items.reduce((sum, item) => sum + item.amount, 0),
    items: items
  });
};

// 9. Full Sync
export const triggerFullSync = async (entityType: string, data: any[]) => {
  return sendToMake('FULL_DB_SYNC', {
    entity: entityType,
    recordCount: data.length,
    records: data
  });
};

// 10. Admin Registration (New)
export const registerAdmin = async (user: any) => {
  return sendToMake('NEW_ADMIN_REGISTERED', {
    name: user.name,
    email: user.email,
    registeredAt: new Date().toISOString()
  });
};

// 11. Password Recovery (New)
export const requestPasswordReset = async (email: string) => {
  return sendToMake('PASSWORD_RESET_REQUEST', {
    email: email,
    requestedAt: new Date().toISOString()
  });
};

// 12. Dashboard Tasks (New)
export const syncTask = async (task: any) => {
  return sendToMake('UPDATE_TASK', {
    taskId: task.id,
    title: task.title,
    description: task.description,
    isCompleted: task.isCompleted,
    dueDate: task.dueDate,
    type: task.type,
    attachment: task.attachment, // Send Attachment Data
    updatedAt: new Date().toISOString()
  });
};

// 13. Team Member (New)
export const syncTeamMember = async (member: any) => {
  return sendToMake('NEW_TEAM_MEMBER', {
    id: member.id,
    name: member.name,
    role: member.role,
    contractType: member.type,
    baseSalary: member.amount,
    paymentDay: member.dueDay,
    registeredAt: new Date().toISOString()
  });
};
