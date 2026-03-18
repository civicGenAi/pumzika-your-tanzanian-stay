import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical, ShieldAlert, CheckCircle, Ban } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

const AdminUsers = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from('users')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update user role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight text-[#1A6B4A]">User Management</h1>
                    <p className="text-muted-foreground mt-1">View and manage all guests, hosts, and admins.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 bg-card border-border rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="pl-6 py-4 font-semibold text-foreground">User</TableHead>
                                <TableHead className="font-semibold text-foreground">Role</TableHead>
                                <TableHead className="font-semibold text-foreground">Joined</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                        Loading users...
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-border">
                                                    <AvatarImage src={user.avatar_url} />
                                                    <AvatarFallback className="bg-primary/5 text-primary">
                                                        {user.full_name?.charAt(0) || user.email?.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-foreground">{user.full_name || 'Unnamed User'}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                user.role === 'admin' ? 'default' :
                                                    user.role === 'host' ? 'secondary' :
                                                        'outline'
                                            } className={`${user.role === 'admin' ? 'bg-[#1A6B4A]' : user.role === 'host' ? 'bg-[#E8A838]/20 text-[#E8A838]' : ''}`}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-full">
                                                        <MoreVertical size={16} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl">
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'guest')}>
                                                        Make Guest
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'host')}>
                                                        Make Host
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleRoleChange(user.id, 'admin')}>
                                                        <ShieldAlert className="mr-2 h-4 w-4" />
                                                        Make Admin
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsers;
