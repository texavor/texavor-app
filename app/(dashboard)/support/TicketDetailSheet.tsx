"use client";

import React, { useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstace";
import { useAppStore } from "@/store/appStore";
import { Loader2, Paperclip, Send } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface TicketDetailSheetProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TicketDetailSheet: React.FC<TicketDetailSheetProps> = ({
  ticketId,
  open,
  onOpenChange,
}) => {
  const { blogs, user } = useAppStore();
  const queryClient = useQueryClient();
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<FileList | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch Ticket Details
  const { data: ticket, isLoading } = useQuery({
    queryKey: ["supportTicket", ticketId],
    queryFn: async () => {
      if (!ticketId || !blogs?.id) return null;
      const res = await axiosInstance.get(
        `/api/v1/blogs/${blogs.id}/support_tickets/${ticketId}`
      );
      return res.data;
    },
    enabled: !!ticketId && !!blogs?.id && open,
  });

  // Post Comment Mutation
  const { mutate: postComment, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      formData.append("comment[message]", data.message);
      if (data.attachments && data.attachments.length > 0) {
        Array.from(data.attachments).forEach((file: any) => {
          formData.append("comment[attachments][]", file);
        });
      }

      return axiosInstance.post(
        `/api/v1/blogs/${blogs?.id}/support_tickets/${ticketId}/comments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTicket", ticketId] });
      setMessage("");
      setAttachments(null);
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const handleSend = () => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return;
    postComment({ message, attachments });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.support_ticket_comments]);

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    if (!ticket) return [];

    // Combine original ticket message (as first message) and comments
    const allMessages = [
      {
        id: "original",
        message: ticket.message,
        created_at: ticket.created_at,
        user: ticket.user,
        attachments_urls: ticket.attachments_urls,
        is_ticket: true,
      },
      ...(ticket.support_ticket_comments || []),
    ];

    const groups: { date: string; messages: any[] }[] = [];

    allMessages.forEach((msg) => {
      if (!msg.created_at) return;
      const date = format(new Date(msg.created_at), "MMMM d, yyyy");
      const existingGroup = groups.find((g) => g.date === date);
      if (existingGroup) {
        existingGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });

    return groups;
  }, [ticket]);

  if (!ticketId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[500px] flex flex-col h-full p-0 bg-white shadow-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader className="px-6 py-4 border-b bg-white">
              <div className="flex items-start gap-4 pr-8">
                <Avatar className="w-10 h-10 border rounded-lg shrink-0">
                  <AvatarFallback className="bg-primary/5 text-primary font-semibold">
                    {ticket?.user?.first_name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SheetTitle className="text-base font-semibold text-[#0A2918] leading-tight truncate">
                      {ticket?.subject}
                    </SheetTitle>
                  </div>
                  <SheetDescription className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="font-medium text-foreground">
                      Ticket #{ticket?.id?.slice(0, 8)}
                    </span>
                    <span>•</span>
                    <Badge
                      variant="outline"
                      className={`capitalize h-5 px-1.5 font-normal ${
                        ticket?.status === "open"
                          ? "border-green-600 text-green-700 bg-green-50"
                          : "text-muted-foreground"
                      }`}
                    >
                      {ticket?.status?.replace("_", " ")}
                    </Badge>
                    <span>•</span>
                    <span
                      className={`capitalize ${
                        ticket?.priority === "critical"
                          ? "text-red-600 font-medium"
                          : ""
                      }`}
                    >
                      {ticket?.priority} Priority
                    </span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="py-6 space-y-6">
                {groupedMessages.map((group) => (
                  <div key={group.date} className="space-y-6">
                    <div className="relative flex items-center justify-center py-2">
                      <div className="absolute inset-x-0 h-px bg-border/40" />
                      <span className="relative bg-white px-3 text-[11px] font-medium text-muted-foreground/80 uppercase tracking-widest border rounded-full py-0.5">
                        {group.date}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {group.messages.map((msg: any) => {
                        const isMe = msg.user?.id === user?.id; // Assuming user.id is available in store
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-3 ${
                              isMe ? "flex-row-reverse" : ""
                            }`}
                          >
                            <Avatar className="w-8 h-8 border">
                              <AvatarFallback className="text-xs">
                                {msg.user?.first_name?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>

                            <div
                              className={`flex flex-col max-w-[85%] ${
                                isMe ? "items-end" : "items-start"
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-xs font-medium text-gray-900">
                                  {msg.user?.first_name || "User"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {msg.created_at &&
                                    format(new Date(msg.created_at), "h:mm a")}
                                </span>
                              </div>

                              <div
                                className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                                  isMe
                                    ? "bg-[#0A2918] text-white rounded-tr-sm"
                                    : "bg-white border text-gray-800 rounded-tl-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed">
                                  {msg.message}
                                </p>
                              </div>

                              {msg.attachments_urls &&
                                msg.attachments_urls.length > 0 && (
                                  <div
                                    className={`mt-2 flex flex-wrap gap-2 ${
                                      isMe ? "justify-end" : ""
                                    }`}
                                  >
                                    {msg.attachments_urls.map(
                                      (url: string, idx: number) => (
                                        <a
                                          key={idx}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="group flex items-center gap-2 px-3 py-2 bg-white border rounded-lg text-xs hover:border-[#0A2918] transition-colors shadow-sm"
                                        >
                                          <div className="p-1.5 bg-green-50 text-[#0A2918] rounded-md">
                                            <Paperclip className="h-3.5 w-3.5" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 group-hover:text-[#0A2918]">
                                              Attachment {idx + 1}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                              Click to view
                                            </span>
                                          </div>
                                        </a>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="space-y-3">
                {attachments && attachments.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2">
                    {Array.from(attachments).map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-md border border-green-100 shrink-0"
                      >
                        <Paperclip className="h-3 w-3 text-[#0A2918]" />
                        <span className="text-xs font-medium text-[#0A2918] truncate max-w-[150px]">
                          {file.name}
                        </span>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setAttachments(null)}
                    >
                      Remove All
                    </Button>
                  </div>
                )}

                <div className="relative rounded-lg border bg-white shadow-none focus-within:border-[#0A2918] transition-all">
                  <Textarea
                    placeholder="Type a reply..."
                    className="min-h-[50px] max-h-[150px] w-full border-none bg-white px-4 py-3 text-sm text-black font-inter resize-none pr-24 placeholder:text-gray-400"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Label
                      htmlFor="comment-attachment"
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                      title="Attach files"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Label>
                    <Input
                      id="comment-attachment"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => setAttachments(e.target.files)}
                    />
                    <Button
                      size="icon"
                      className="h-8 w-8 bg-[#0A2918] hover:bg-[#0A2918]/90 text-white rounded-lg"
                      onClick={handleSend}
                      disabled={isPending || (!message.trim() && !attachments)}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="text-[10px] text-center text-muted-foreground">
                  Press Enter to send, Shift + Enter for new line
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
