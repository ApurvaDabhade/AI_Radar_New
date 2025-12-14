# memory/memory_handler.py

from langchain_community.chat_message_histories import ChatMessageHistory
from langchain.schema import AIMessage, HumanMessage

# Shared memory instance
history = ChatMessageHistory()

def add_message(role: str, content: str):
    """Add message to memory."""
    if role == "user":
        history.add_user_message(content)
    elif role == "bot":
        history.add_ai_message(content)

def get_memory_messages():
    """Retrieve stored conversation messages."""
    return history.messages

def clear_memory():
    """Optional: clear the chat history."""
    history.clear()
