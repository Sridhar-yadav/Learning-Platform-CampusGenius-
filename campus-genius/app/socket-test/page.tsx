"use client";

import { useState, useCallback } from "react";
import { useWebSocket } from "@/lib/socket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SocketTestPage() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");

    const handleMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, `Received: ${JSON.stringify(data)}`]);
        } catch (e) {
            setMessages((prev) => [...prev, `Received: ${event.data}`]);
        }
    }, []);

    const { connect, disconnect, sendMessage, status } = useWebSocket("/chat/testroom/", {
        onMessage: handleMessage,
        onOpen: () => setMessages((prev) => [...prev, "Connected!"]),
        onClose: () => setMessages((prev) => [...prev, "Disconnected"]),
        autoConnect: true,
    });

    const handleSend = () => {
        if (!input) return;
        sendMessage(JSON.stringify({ message: input }));
        setMessages((prev) => [...prev, `Sent: ${input}`]);
        setInput("");
    };

    return (
        <div className="container mx-auto p-10 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        WebSocket Test
                        <Badge variant={status === "OPEN" ? "default" : "destructive"}>
                            {status}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-slate-950 text-slate-50 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm space-y-1">
                        {messages.length === 0 && <span className="text-slate-500">Log is empty...</span>}
                        {messages.map((msg, i) => (
                            <div key={i}>{msg}</div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button onClick={handleSend} disabled={status !== "OPEN"}>Send</Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={connect} disabled={status === "OPEN" || status === "CONNECTING"}>
                            Connect
                        </Button>
                        <Button variant="destructive" onClick={disconnect} disabled={status === "CLOSED"}>
                            Disconnect
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
