# memory/memory_handler.py

from langchain_community.chat_message_histories import ChatMessageHistory

history = ChatMessageHistory()

def add_message(role: str, content: str):
    if role == "user":
        history.add_user_message(content)
    elif role == "bot":
        history.add_ai_message(content)

def get_memory_messages():
    return history.messages

def clear_memory():
    history.clear()