"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  MoreVertical,
  Phone,
  Video as VideoCall,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCheck,
  Edit,
  Trash2,
  Reply,
  Forward,
  Download,
  Star,
  Archive,
  Settings,
  Users,
  Clock,
  Plus,
  UserPlus,
  UsersRound,
  PhoneCall,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  File,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ---------- Types ----------
type MessageStatus = "sent" | "delivered" | "read";
type MessageType = "text" | "image" | "file" | "audio" | "video" | "call";
type ConversationType = "single" | "group" | "support";

interface Attachment {
  name: string;
  size: string;
  type: string;
  url?: string; // object URL for preview
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  status: MessageStatus;
  replyTo?: string;
  edited?: boolean;
  deleted?: boolean;
  attachments?: Attachment[];
  callInfo?: {
    type: "audio" | "video";
    duration: number; // in seconds
    ended: boolean;
  };
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: Date;
  role?: string;
}

interface Conversation {
  id: string;
  type: ConversationType;
  participants: Participant[];
  messages: Message[];
  unreadCount: number;
  pinned: boolean;
  muted: boolean;
}

// ---------- Mock Data ----------
const currentUserId = "teacher-001";

const initialParticipants: Participant[] = [
  { id: "student-001", name: "Alice Johnson", avatar: "https://i.pravatar.cc/150?img=1", online: true, role: "Student" },
  { id: "student-002", name: "Bob Smith", avatar: "https://i.pravatar.cc/150?img=3", online: false, lastSeen: new Date(Date.now() - 3600000), role: "Student" },
  { id: "student-003", name: "Charlie Brown", avatar: "https://i.pravatar.cc/150?img=5", online: true, role: "Student" },
  { id: "teacher-002", name: "Diana White", avatar: "https://i.pravatar.cc/150?img=7", online: true, role: "Teacher" },
  { id: "support-001", name: "Paslearn Support", avatar: "https://i.pravatar.cc/150?img=9", online: true, role: "Support" },
];

const initialConversations: Conversation[] = [
  {
    id: "conv-001",
    type: "single",
    participants: [initialParticipants[0]],
    unreadCount: 2,
    pinned: true,
    muted: false,
    messages: [
      {
        id: "msg-001",
        senderId: "student-001",
        content: "Hi teacher, I have a question about the homework.",
        type: "text",
        timestamp: new Date(Date.now() - 3600000),
        status: "read",
      },
      {
        id: "msg-002",
        senderId: currentUserId,
        content: "Sure, what's your question?",
        type: "text",
        timestamp: new Date(Date.now() - 3500000),
        status: "read",
      },
      {
        id: "msg-003",
        senderId: "student-001",
        content: "Can you explain the second problem?",
        type: "text",
        timestamp: new Date(Date.now() - 3400000),
        status: "read",
      },
    ],
  },
  {
    id: "conv-002",
    type: "single",
    participants: [initialParticipants[1]],
    unreadCount: 0,
    pinned: false,
    muted: false,
    messages: [
      {
        id: "msg-004",
        senderId: "student-002",
        content: "Thank you for the feedback!",
        type: "text",
        timestamp: new Date(Date.now() - 86400000),
        status: "read",
      },
    ],
  },
  {
    id: "conv-003",
    type: "group",
    participants: [initialParticipants[0], initialParticipants[2], initialParticipants[3]],
    unreadCount: 5,
    pinned: false,
    muted: true,
    messages: [
      {
        id: "msg-005",
        senderId: "student-003",
        content: "Group project meeting tomorrow?",
        type: "text",
        timestamp: new Date(Date.now() - 7200000),
        status: "read",
      },
      {
        id: "msg-006",
        senderId: currentUserId,
        content: "Yes, at 3 PM.",
        type: "text",
        timestamp: new Date(Date.now() - 7100000),
        status: "delivered",
      },
    ],
  },
  {
    id: "conv-004",
    type: "support",
    participants: [initialParticipants[4]],
    unreadCount: 0,
    pinned: false,
    muted: false,
    messages: [
      {
        id: "msg-007",
        senderId: "support-001",
        content: "Your ticket #1234 has been resolved.",
        type: "text",
        timestamp: new Date(Date.now() - 172800000),
        status: "read",
      },
    ],
  },
];

// ---------- Helper Components ----------
function MessageStatusIndicator({ status }: { status: MessageStatus }) {
  switch (status) {
    case "sent":
      return <Check className="h-4 w-4 text-muted-foreground" />;
    case "delivered":
      return <CheckCheck className="h-4 w-4 text-muted-foreground" />;
    case "read":
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    default:
      return null;
  }
}

function OnlineIndicator({ online }: { online: boolean }) {
  return (
    <span className={cn("h-2.5 w-2.5 rounded-full", online ? "bg-green-500" : "bg-gray-300")} />
  );
}

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  if (attachment.type.startsWith("image/") && attachment.url) {
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        className="rounded-lg max-h-48 object-cover"
      />
    );
  }
  if (attachment.type.startsWith("audio/") && attachment.url) {
    return (
      <audio controls src={attachment.url} className="w-full" />
    );
  }
  if (attachment.type.startsWith("video/") && attachment.url) {
    return (
      <video controls src={attachment.url} className="rounded-lg max-h-48" />
    );
  }
  return (
    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
      <FileText className="h-5 w-5" />
      <span className="text-sm">{attachment.name}</span>
      <span className="text-xs text-muted-foreground">{attachment.size}</span>
    </div>
  );
}

function CallLogMessage({ message }: { message: Message }) {
  const isIncoming = message.senderId !== currentUserId;
  return (
    <div className="flex justify-center my-2">
      <div className="bg-muted rounded-full px-4 py-1 text-sm flex items-center gap-2">
        {message.callInfo?.type === "audio" ? (
          <Phone className="h-4 w-4" />
        ) : (
          <Video className="h-4 w-4" />
        )}
        <span>{isIncoming ? "Incoming" : "Outgoing"} {message.callInfo?.type} call</span>
        <span className="text-muted-foreground">· {message.callInfo?.duration ?? 0} sec</span>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  participants,
  onReply,
  onEdit,
  onDelete,
}: {
  message: Message;
  isOwn: boolean;
  participants: Record<string, Participant>;
  onReply: (messageId: string) => void;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}) {
  const sender = participants[message.senderId];
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleSaveEdit = () => {
    onEdit(message.id, editContent);
    setIsEditing(false);
  };

  if (message.deleted) {
    return (
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <div className="bg-muted px-4 py-2 rounded-lg text-muted-foreground italic text-sm">
          Message deleted
        </div>
      </div>
    );
  }

  if (message.type === "call") {
    return <CallLogMessage message={message} />;
  }

  const repliedMessage = message.replyTo
    ? participants[message.senderId] // placeholder, actual implementation would find message
      ? undefined
      : undefined
    : undefined;

  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[70%] space-y-1", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={sender?.avatar} alt={sender?.name} />
              <AvatarFallback>{sender?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{sender?.name}</span>
          </div>
        )}
        {message.replyTo && (
          <div className={cn("border-l-2 pl-2 text-xs text-muted-foreground", isOwn ? "border-primary" : "border-muted-foreground")}>
            Replying to: ...
          </div>
        )}
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm shadow-sm",
            isOwn ? "bg-primary text-primary-foreground" : "bg-card border"
          )}
        >
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="h-8"
              />
              <Button size="sm" onClick={handleSaveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              {message.content && <p>{message.content}</p>}
              {message.attachments?.map((att, idx) => (
                <div key={idx} className="mt-2">
                  <AttachmentPreview attachment={att} />
                  <div className="text-xs text-muted-foreground mt-1">{att.name} ({att.size})</div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", isOwn ? "justify-end" : "justify-start")}>
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          {isOwn && <MessageStatusIndicator status={message.status} />}
          {message.edited && <span>(edited)</span>}
        </div>
      </div>
      {isOwn && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReply(message.id)}>
              <Reply className="mr-2 h-4 w-4" /> Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const emojis = ["😀", "😂", "😊", "😍", "🤔", "👍", "👏", "🙏", "🎉", "💯", "🔥", "❤️"];
  return (
    <div className="absolute bottom-full mb-2 p-2 bg-card border rounded-lg shadow-lg grid grid-cols-4 gap-1 z-10">
      {emojis.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:bg-muted rounded p-1"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function ConversationListItem({
  conversation,
  active,
  onSelect,
  onTogglePin,
  onToggleMute,
  onDelete,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
  onTogglePin: (id: string) => void;
  onToggleMute: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg group",
        active && "bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
          <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0">
          <OnlineIndicator online={otherParticipant?.online || false} />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-medium truncate">
            {conversation.type === "group" ? (
              <span className="flex items-center gap-1">
                <UsersRound className="h-3 w-3" /> {conversation.participants.map(p => p.name).join(", ")}
              </span>
            ) : (
              otherParticipant?.name
            )}
          </p>
          <div className="flex items-center gap-1">
            {conversation.pinned && <Star className="h-3 w-3 text-yellow-500" />}
            {conversation.muted && <Archive className="h-3 w-3 text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">
              {lastMessage ? lastMessage.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {lastMessage?.type === "file" ? "📎 " : lastMessage?.type === "image" ? "📷 " : ""}
            {lastMessage?.content || "No messages"}
          </p>
          {conversation.unreadCount > 0 && (
            <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center">
              {conversation.unreadCount}
            </Badge>
          )}
        </div>
      </div>
      {/* Hover actions */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onTogglePin(conversation.id); }}>
          <Star className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onToggleMute(conversation.id); }}>
          <Archive className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={(e) => { e.stopPropagation(); onDelete(conversation.id); }}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ---------- Modals ----------
function NewChatModal({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (participantId: string) => void }) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleCreate = () => {
    if (selectedUserId) {
      onCreate(selectedUserId);
      onOpenChange(false);
      setSelectedUserId("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Select a participant to start a chat.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select participant" />
            </SelectTrigger>
            <SelectContent>
              {initialParticipants
                .filter(p => p.id !== currentUserId)
                .map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button className="w-full" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Start Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NewGroupModal({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (open: boolean) => void; onCreate: (participantIds: string[]) => void }) {
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleCreate = () => {
    if (groupName && selectedParticipants.length > 0) {
      onCreate(selectedParticipants);
      onOpenChange(false);
      setGroupName("");
      setSelectedParticipants([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Add participants and set a group name.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Group name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
            {initialParticipants
              .filter(p => p.id !== currentUserId)
              .map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`group-${p.id}`}
                    checked={selectedParticipants.includes(p.id)}
                    onChange={() => toggleParticipant(p.id)}
                    className="h-4 w-4"
                  />
                  <label htmlFor={`group-${p.id}`} className="text-sm flex items-center gap-2">
                    {p.name}
                  </label>
                </div>
              ))}
          </div>
          <Button className="w-full" onClick={handleCreate}>
            <UsersRound className="mr-2 h-4 w-4" /> Create Group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CallModal({ open, onOpenChange, type, onEndCall }: { open: boolean; onOpenChange: (open: boolean) => void; type: "audio" | "video"; onEndCall: (duration: number) => void }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (open) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setSeconds(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [open]);

  const handleEndCall = () => {
    onEndCall(seconds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) handleEndCall(); }}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <DialogTitle>{type === "audio" ? "Audio Call" : "Video Call"}</DialogTitle>
        </DialogHeader>
        <div className="py-8 space-y-4">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src="https://i.pravatar.cc/150?img=1" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <p className="text-lg font-medium">Calling...</p>
          <p className="text-muted-foreground">{seconds} seconds</p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setIsMuted(!isMuted)}>
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>
            {type === "video" && (
              <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => setIsVideoOff(!isVideoOff)}>
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
              </Button>
            )}
            <Button variant="destructive" size="icon" className="h-12 w-12" onClick={handleEndCall}>
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PreviewModal({ attachment, onClose }: { attachment: Attachment | null; onClose: () => void }) {
  if (!attachment) return null;
  return (
    <Dialog open={!!attachment} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{attachment.name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <AttachmentPreview attachment={attachment} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------
export default function ChatDashboard() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>("conv-001");
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "unread" | "pinned">("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [newGroupModalOpen, setNewGroupModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

  // Derived
  const filteredConversations = useMemo(() => {
    let result = conversations;
    if (filterType === "unread") result = result.filter(c => c.unreadCount > 0);
    if (filterType === "pinned") result = result.filter(c => c.pinned);
    if (searchQuery) {
      result = result.filter(c =>
        c.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return result;
  }, [conversations, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredConversations.length / itemsPerPage);
  const paginatedConversations = filteredConversations.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;
  const otherParticipant = selectedConversation?.participants.find(p => p.id !== currentUserId) || selectedConversation?.participants[0];

  // Update conversation helper
  const updateConversation = (conversationId: string, updater: (conv: Conversation) => Conversation) => {
    setConversations(prev =>
      prev.map(conv => conv.id === conversationId ? updater(conv) : conv)
    );
  };

  // Send message with attachments
  const handleSendMessage = () => {
    if (!selectedConversation) return;
    const content = messageInput.trim();
    if (!content && pendingAttachments.length === 0) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      content: content || "",
      type: pendingAttachments.length > 0
        ? pendingAttachments[0].type.startsWith("image/") ? "image"
        : pendingAttachments[0].type.startsWith("video/") ? "video"
        : pendingAttachments[0].type.startsWith("audio/") ? "audio"
        : "file"
        : "text",
      timestamp: new Date(),
      status: "sent",
      replyTo: replyingTo || undefined,
      attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
    };

    updateConversation(selectedConversation.id, conv => ({
      ...conv,
      messages: [...conv.messages, newMessage],
      unreadCount: 0,
    }));

    setMessageInput("");
    setReplyingTo(null);
    setPendingAttachments([]);
    setIsTyping(false);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];
    Array.from(files).forEach(file => {
      const type = file.type;
      const url = URL.createObjectURL(file);
      newAttachments.push({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type,
        url,
      });
    });
    setPendingAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Edit message
  const handleEditMessage = (messageId: string, content: string) => {
    if (!selectedConversation) return;
    updateConversation(selectedConversation.id, conv => ({
      ...conv,
      messages: conv.messages.map(msg =>
        msg.id === messageId ? { ...msg, content, edited: true } : msg
      ),
    }));
  };

  // Delete message (soft delete)
  const handleDeleteMessage = (messageId: string) => {
    if (!selectedConversation) return;
    updateConversation(selectedConversation.id, conv => ({
      ...conv,
      messages: conv.messages.map(msg =>
        msg.id === messageId ? { ...msg, deleted: true, content: "" } : msg
      ),
    }));
  };

  // Start a call
  const startCall = (type: "audio" | "video") => {
    if (!selectedConversation) return;
    setCallType(type);
    setCallModalOpen(true);
  };

  // End call and add call log message
  const handleEndCall = (duration: number) => {
    if (!selectedConversation) return;
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      content: "",
      type: "call",
      timestamp: new Date(),
      status: "read",
      callInfo: {
        type: callType,
        duration,
        ended: true,
      },
    };
    updateConversation(selectedConversation.id, conv => ({
      ...conv,
      messages: [...conv.messages, newMessage],
    }));
  };

  // Create new chat
  const handleCreateChat = (participantId: string) => {
    const participant = initialParticipants.find(p => p.id === participantId);
    if (!participant) return;
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      type: "single",
      participants: [participant],
      unreadCount: 0,
      pinned: false,
      muted: false,
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setSelectedConversationId(newConv.id);
  };

  // Create group
  const handleCreateGroup = (participantIds: string[]) => {
    const groupParticipants = initialParticipants.filter(p => participantIds.includes(p.id));
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      type: "group",
      participants: groupParticipants,
      unreadCount: 0,
      pinned: false,
      muted: false,
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setSelectedConversationId(newConv.id);
  };

  // Toggle pin/mute/delete
  const togglePin = (conversationId: string) => {
    updateConversation(conversationId, conv => ({ ...conv, pinned: !conv.pinned }));
  };

  const toggleMute = (conversationId: string) => {
    updateConversation(conversationId, conv => ({ ...conv, muted: !conv.muted }));
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (selectedConversationId === conversationId) setSelectedConversationId(null);
  };

  // Toggle sidebars
  const toggleSidebar = (side: "left" | "right") => {
    if (side === "left") setShowLeftSidebar(prev => !prev);
    else setShowRightSidebar(prev => !prev);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-background overflow-hidden">
      {/* Left Sidebar */}
      {showLeftSidebar && (
        <aside className="w-full sm:w-80 border-r flex flex-col shrink-0">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setNewChatModalOpen(true)}>
                  <UserPlus className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setNewGroupModalOpen(true)}>
                  <UsersRound className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => toggleSidebar("left")}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={filterType === "all" ? "secondary" : "ghost"} size="sm" onClick={() => setFilterType("all")}>All</Button>
              <Button variant={filterType === "unread" ? "secondary" : "ghost"} size="sm" onClick={() => setFilterType("unread")}>Unread</Button>
              <Button variant={filterType === "pinned" ? "secondary" : "ghost"} size="sm" onClick={() => setFilterType("pinned")}>Pinned</Button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {paginatedConversations.map(conv => (
              <ConversationListItem
                key={conv.id}
                conversation={conv}
                active={conv.id === selectedConversationId}
                onSelect={() => setSelectedConversationId(conv.id)}
                onTogglePin={togglePin}
                onToggleMute={toggleMute}
                onDelete={deleteConversation}
              />
            ))}
          </div>
          <div className="p-2 border-t">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
              <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!showLeftSidebar && (
              <Button variant="ghost" size="icon" onClick={() => toggleSidebar("left")}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            )}
            {selectedConversation ? (
              <>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
                  <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold flex items-center gap-2">
                    {selectedConversation.type === "group" && <UsersRound className="h-4 w-4" />}
                    {selectedConversation.type === "group"
                      ? selectedConversation.participants.map(p => p.name).join(", ")
                      : otherParticipant?.name}
                  </h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <OnlineIndicator online={otherParticipant?.online || false} />
                    {otherParticipant?.online ? "Online" : "Offline"}
                  </p>
                </div>
              </>
            ) : (
              <h2 className="font-semibold">Select a conversation</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => startCall("audio")}><Phone className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Voice Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => startCall("video")}><VideoCall className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Video Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => toggleSidebar("right")}><Info className="h-5 w-5" /></Button>
                </TooltipTrigger>
                <TooltipContent>Details</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedConversation?.messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
              participants={Object.fromEntries(initialParticipants.map(p => [p.id, p]))}
              onReply={(id) => setReplyingTo(id)}
              onEdit={handleEditMessage}
              onDelete={handleDeleteMessage}
            />
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="animate-pulse">●</span> Typing...
            </div>
          )}
        </div>

        {/* Reply indicator */}
        {replyingTo && (
          <div className="px-4 py-2 border-t flex items-center justify-between bg-muted/30">
            <p className="text-sm">
              Replying to: {selectedConversation?.messages.find(m => m.id === replyingTo)?.content?.slice(0, 50)}...
            </p>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t">
          {pendingAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {pendingAttachments.map((att, idx) => (
                <div key={idx} className="relative bg-muted rounded-lg p-2">
                  <AttachmentPreview attachment={att} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 bg-background rounded-full shadow"
                    onClick={() => removePendingAttachment(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="relative flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileInputChange}
            />
            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(prev => !prev)}>
              <Smile className="h-5 w-5" />
            </Button>
            {showEmojiPicker && <EmojiPicker onSelect={(emoji) => { setMessageInput(prev => prev + emoji); setShowEmojiPicker(false); }} />}
            <Input
              value={messageInput}
              onChange={(e) => { setMessageInput(e.target.value); setIsTyping(true); }}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!messageInput.trim() && pendingAttachments.length === 0}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {showRightSidebar && (
        <aside className="w-full sm:w-72 border-l flex flex-col shrink-0">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Details</h2>
            <Button variant="ghost" size="icon" onClick={() => toggleSidebar("right")}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {selectedConversation && (
              <>
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={otherParticipant?.avatar} alt={otherParticipant?.name} />
                    <AvatarFallback>{otherParticipant?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="mt-2 font-semibold">{otherParticipant?.name}</h3>
                  <p className="text-sm text-muted-foreground">{otherParticipant?.role}</p>
                </div>
                <Separator />
                {selectedConversation.type === "group" && (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Participants</h4>
                      <div className="space-y-2">
                        {selectedConversation.participants.map(p => (
                          <div key={p.id} className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={p.avatar} alt={p.name} />
                              <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{p.name}</span>
                            <OnlineIndicator online={p.online} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <h4 className="font-medium mb-2">Shared Media</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedConversation.messages
                      .filter(m => m.attachments && m.attachments.length > 0)
                      .flatMap(m => m.attachments!.map((att, i) => ({ att, msgId: m.id, idx: i })))
                      .slice(0, 9)
                      .map(({ att, msgId, idx }) => (
                        <div
                          key={`${msgId}-${idx}`}
                          className="aspect-square bg-muted rounded flex items-center justify-center cursor-pointer hover:opacity-80"
                          onClick={() => setPreviewAttachment(att)}
                        >
                          {att.type.startsWith("image/") && att.url ? (
                            <img src={att.url} alt={att.name} className="w-full h-full object-cover rounded" />
                          ) : (
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
                <Separator />
                <div className="space-y-1">
                  <h4 className="font-medium mb-2">Options</h4>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => togglePin(selectedConversation.id)}>
                    <Star className="mr-2 h-4 w-4" /> {selectedConversation.pinned ? "Unpin" : "Pin"} Conversation
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => toggleMute(selectedConversation.id)}>
                    <Archive className="mr-2 h-4 w-4" /> {selectedConversation.muted ? "Unmute" : "Mute"} Notifications
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-red-600" onClick={() => deleteConversation(selectedConversation.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Conversation
                  </Button>
                </div>
              </>
            )}
          </div>
        </aside>
      )}

      {/* Modals */}
      <NewChatModal open={newChatModalOpen} onOpenChange={setNewChatModalOpen} onCreate={handleCreateChat} />
      <NewGroupModal open={newGroupModalOpen} onOpenChange={setNewGroupModalOpen} onCreate={handleCreateGroup} />
      <CallModal
        open={callModalOpen}
        onOpenChange={setCallModalOpen}
        type={callType}
        onEndCall={handleEndCall}
      />
      <PreviewModal attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
    </div>
  );
}