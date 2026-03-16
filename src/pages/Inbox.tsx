import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { MessageSquare, Search, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Inbox = () => {
    const chats = [
        { name: 'Abdalla (Host)', lastMsg: 'I will be there at 2pm to welcome you!', time: '10:30 AM', active: true, property: 'Dhow House' },
        { name: 'Sarah (Host)', lastMsg: 'The key is in the lockbox.', time: 'Yesterday', active: false, property: 'Kibo Summit' },
        { name: 'Pumzika Support', lastMsg: 'Your reservation is confirmed.', time: 'Mar 12', active: false, property: 'System' },
    ];

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-0">
            <Navbar />
            <main className="container pt-10 h-[calc(100vh-140px)]">
                <div className="flex h-full border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
                    {/* Sidebar */}
                    <div className="w-full md:w-80 border-r border-border flex flex-col">
                        <div className="p-4 border-b border-border space-y-4">
                            <h1 className="text-xl font-bold">Inbox</h1>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-2.5 text-muted-foreground" />
                                <Input placeholder="Search messages" className="pl-10 h-9" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
                            {chats.map((chat, i) => (
                                <div key={i} className={`p-4 flex gap-4 hover:bg-muted/30 cursor-pointer transition-colors ${chat.active ? 'bg-primary/5' : ''}`}>
                                    <div className="h-12 w-12 rounded-full bg-secondary shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold truncate text-sm">{chat.name}</p>
                                            <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                                        </div>
                                        <p className="text-xs font-medium text-foreground/80 truncate">{chat.property}</p>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{chat.lastMsg}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chat Window (Desktop) */}
                    <div className="hidden md:flex flex-1 flex-col bg-muted/10">
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-secondary" />
                                <div>
                                    <p className="font-bold text-sm">Abdalla (Host)</p>
                                    <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-muted rounded-full transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-12 opacity-40">
                            <MessageSquare size={48} className="mb-4" />
                            <p className="text-lg font-bold">Select a message</p>
                            <p className="text-sm">Choose from your existing conversations or start search.</p>
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    );
};

export default Inbox;
