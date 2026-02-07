import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { getMessaging } from 'firebase-admin/messaging';
import { onValueCreated } from 'firebase-functions/v2/database';

initializeApp();

export const onNewChatMessage = onValueCreated(
  {
    ref: '/chat/messages/{messageId}',
    instance: 'familyapp-e83b7-default-rtdb',
    region: 'europe-west1',
  },
  async (event) => {
    const message = event.data.val();
    if (!message) return;

    const senderUid = message.uid as string;
    const senderName = message.displayName as string || 'Quelqu\'un';
    const text = message.text as string || '';
    const hasImage = !!message.imageURL;

    const body = hasImage && !text
      ? `${senderName} a partagé une photo`
      : text.length > 100 ? text.substring(0, 100) + '…' : text;

    // Get all users to find FCM tokens
    const usersSnapshot = await getDatabase().ref('/users').once('value');
    const users = usersSnapshot.val();
    if (!users) return;

    const tokens: string[] = [];
    for (const [uid, userData] of Object.entries(users)) {
      if (uid === senderUid) continue;
      const user = userData as Record<string, unknown>;
      if (user.fcmToken && typeof user.fcmToken === 'string') {
        tokens.push(user.fcmToken);
      }
    }

    if (tokens.length === 0) return;

    const response = await getMessaging().sendEachForMulticast({
      tokens,
      data: {
        title: `💬 ${senderName}`,
        body,
        url: '/chat',
      },
    });

    // Clean up invalid tokens
    if (response.failureCount > 0) {
      const allUsers = Object.entries(users);
      const tokensToRemove: Promise<void>[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = tokens[idx];
          const userEntry = allUsers.find(
            ([uid, data]) => uid !== senderUid && (data as Record<string, unknown>).fcmToken === failedToken
          );
          if (userEntry) {
            tokensToRemove.push(
              getDatabase().ref(`/users/${userEntry[0]}/fcmToken`).remove()
            );
          }
        }
      });

      await Promise.all(tokensToRemove);
    }
  }
);
