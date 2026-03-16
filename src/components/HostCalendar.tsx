import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

export const HostCalendar = () => {
    const [date, setDate] = useState<Date | undefined>(new Date());

    return (
        <div className="space-y-6 animate-in fade-in duration-500 text-foreground">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="font-display text-2xl font-bold tracking-tight text-[#1A6B4A]">Calendar</h2>
                    <p className="text-muted-foreground text-sm">Manage your property availability and pricing calendar.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-none shadow-sm gap-2">
                        <Lock size={18} /> Block Dates
                    </Button>
                    <Button className="rounded-xl bg-[#1A6B4A] text-white hover:bg-[#1A6B4A]/90 gap-2">
                        <Plus size={18} /> Special Rates
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden min-h-[500px]">
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-[#1A6B4A]">Availability Calendar</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0"><ChevronLeft size={16} /></Button>
                                <Button variant="outline" size="sm" className="rounded-full h-8 w-8 p-0"><ChevronRight size={16} /></Button>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-xl border shadow-sm"
                                classNames={{
                                    day_selected: "bg-[#1A6B4A] text-white hover:bg-[#1A6B4A] hover:text-white focus:bg-[#1A6B4A] focus:text-white",
                                    day_today: "bg-accent/50 text-accent-foreground font-bold",
                                    caption: "flex justify-center pt-1 relative items-center mb-4",
                                    caption_label: "text-lg font-bold text-[#1A6B4A]",
                                    nav: "hidden space-x-1 flex items-center",
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-[#1A6B4A] text-white">
                        <CardContent className="p-6">
                            <h4 className="font-bold flex items-center gap-2">
                                <CalendarIcon size={18} className="text-[#E8A838]" /> Block selected dates
                            </h4>
                            <p className="text-xs text-white/70 mt-4 leading-relaxed">
                                Select dates on the calendar to mark them as unavailable for guests.
                            </p>
                            <Button className="w-full mt-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border-white/20 border">
                                Select Dates
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
                        <CardContent className="p-6">
                            <h4 className="font-bold text-[#1A6B4A]">Calendar Legend</h4>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-emerald-100" />
                                    <span className="text-sm font-medium">Available</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-[#1A6B4A]" />
                                    <span className="text-sm font-medium">Selected</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-rose-100" />
                                    <span className="text-sm font-medium">Booked</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-3 w-3 rounded-full bg-gray-100" />
                                    <span className="text-sm font-medium">Blocked</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
