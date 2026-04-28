// Simple localStorage alternative for contact messages
export const saveContactMessage = (messageData) => {
  try {
    const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    const newMessage = {
      ...messageData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    existingMessages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
    return { success: true, id: newMessage.id };
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return { success: false, error: error.message };
  }
};

export const getContactMessages = () => {
  try {
    return JSON.parse(localStorage.getItem('contactMessages') || '[]');
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
};
