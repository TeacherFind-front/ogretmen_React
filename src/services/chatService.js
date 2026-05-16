import * as signalR from "@microsoft/signalr";
import BASE_URL from "./api";

let connection = null;

/**
 * SignalR bağlantısını başlatır.
 */
export const startChatConnection = async (onMessageReceived, onNotificationReceived) => {
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

  connection.on("ReceiveMessage", (message) => {
    if (onMessageReceived) onMessageReceived(message);
  });

  connection.on("ReceiveNotification", (notification) => {
    if (onNotificationReceived) onNotificationReceived(notification);
  });

  try {
    await connection.start();
    console.log("SignalR Connected.");
    return connection;
  } catch (err) {
    console.error("SignalR Connection Error: ", err);
    setTimeout(() => startChatConnection(onMessageReceived, onNotificationReceived), 5000);
    return null;
  }
};

/**
 * Mesaj gönderir.
 */
export const sendMessageLive = async (receiverId, content) => {
  if (connection && connection.state === signalR.HubConnectionState.Connected) {
    try {
      await connection.invoke("SendMessage", { receiverId, content });
      return true;
    } catch (err) {
      console.error("SendMessage Error: ", err);
      return false;
    }
  }
  return false;
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
