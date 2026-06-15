import * as signalR from "@microsoft/signalr";
import BASE_URL, { apiFetch } from "./api";

let connection = null;

/**
 * SignalR bağlantısını başlatır.
 */
export const startChatConnection = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_URL}/chat`, {
      accessTokenFactory: () => token,
      skipNegotiation: false,
      transport: signalR.HttpTransportType.WebSockets
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  try {
    await connection.start();
    console.log("SignalR Connected.");
    return connection;
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
    setTimeout(() => startChatConnection(), 5000);
    return null;
  }
};

/**
 * Mesaj gönderir.
 */
export const sendMessageLive = async (receiverId, content, replyToMessageId = null) => {
  try {
    if (!connection || connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("SignalR not connected. Trying to reconnect...");
      await startChatConnection();
    }
    const payload = { receiverId, content };
    if (replyToMessageId) payload.replyToMessageId = replyToMessageId;
    await connection.invoke("SendMessage", payload);
    return true;
  } catch (err) {
    console.error("SignalR SendMessage error:", err);
    return false;
  }
};

/**
 * Cihaz token'ını (FCM) bildirimler için kaydeder
 */
export const registerDeviceToken = async (fcmToken) => {
  try {
    const response = await apiFetch("/api/devices/register", {
      method: "POST",
      body: JSON.stringify({
        fcmToken,
        platform: "web",
      }),
    });

    if (!response || !response.ok) {
      throw new Error("Cihaz token kaydı başarısız.");
    }

    return await response.json();
  } catch (err) {
    console.error("Device token register failed", err);
    throw err;
  }
};

/**
 * Bağlantıyı kapatır.
 */
export const stopChatConnection = async () => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};

export const getChatConnection = () => connection;
