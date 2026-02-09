import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/app/context/AppContext';
import { useAuth } from '@/app/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from '@/app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import {
  Store,
  Users,
  ShieldCheck,
  Save,
  ArrowLeft,
  Building2,
  Lock,
  UserCircle,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Phone,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/app/types';
import { geocodeAddress, reverseGeocodeCoordinates } from '@/app/services/geocoding';

const SPECIAL_CHARS = "@$!%*?&#^()-_=+[]{}|;:',.<>/~`";

function getPasswordRequirements(password: string) {
  return [
    { label: 'Between 12 and 36 characters', met: password.length >= 12 && password.length <= 36 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'At least one number (0-9)', met: /\d/.test(password) },
    { label: `At least one special character (${SPECIAL_CHARS})`, met: /[@$!%*?&#^()\-_=+\[\]{}|;:',.<>\/~`]/.test(password) },
  ];
}

function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every(r => r.met);
}

interface StoreSettingsProps {
  onBack?: () => void;
}

export function StoreSettings({ onBack }: StoreSettingsProps) {
  const {
    storeSettings,
    updateStoreSettings,
    storeUsers,
    user,
    addUser,
    updateUser,
    deleteUser
  } = useApp();
  const { updateProfile, changePassword } = useAuth();

  const isManager = user?.role === 'manager';

  const [formData, setFormData] = useState({ ...storeSettings });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [storeErrors, setStoreErrors] = useState<{ [key: string]: string | null }>({});

  // User Dialog State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'employee' as 'manager' | 'employee',
    status: 'Active' as 'Active' | 'Inactive'
  });

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });

  // Sync form when editing starts or dialog opens
  useEffect(() => {
    if (editingUser) {
      setUserForm({
        name: editingUser.name,
        email: editingUser.email || '',
        username: editingUser.username,
        password: '',
        role: editingUser.role,
        status: editingUser.status || 'Active'
      });
    } else {
      setUserForm({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'employee',
        status: 'Active'
      });
    }
  }, [editingUser, isUserDialogOpen]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
    });
  }, [user]);

  const autoGeocode = useCallback(async (addr: string) => {
    if (!addr.trim()) {
      setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
      setStoreErrors(prev => ({ ...prev, location: null }));
      return;
    }
    setIsGeocoding(true);
    setStoreErrors(prev => ({ ...prev, location: null }));
    try {
      const coords = await geocodeAddress(addr);
      if (coords) {
        setFormData(prev => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
        setStoreErrors(prev => ({ ...prev, location: null }));
      } else {
        setFormData(prev => ({ ...prev, latitude: undefined, longitude: undefined }));
        toast.error('Could not auto-geocode address. Please try a different address.');
        setStoreErrors(prev => ({ ...prev, location: 'Could not resolve address to coordinates' }));
      }
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      autoGeocode(formData.address || '');
    }, 500);
    return () => clearTimeout(handler);
  }, [formData.address, autoGeocode]);

  useEffect(() => {
    const fetchCountryCode = async () => {
      if (formData.latitude !== undefined && formData.longitude !== undefined) {
        const code = await reverseGeocodeCoordinates(formData.latitude, formData.longitude);
        setFormData(prev => ({ ...prev, countryCode: code || '' }));
      } else {
        setFormData(prev => ({ ...prev, countryCode: '' }));
      }
    };
    fetchCountryCode();
  }, [formData.latitude, formData.longitude]);

  const validateStoreForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!formData.companyName?.trim()) newErrors.companyName = 'Company Name is required';
    if (!formData.uen?.trim()) newErrors.uen = 'UEN is required';
    if (!formData.storeName?.trim()) newErrors.storeName = 'Store Name is required';
    if (!formData.address?.trim()) newErrors.address = 'Full Address is required';

    const cleanedContact = (formData.contactNumber || '').replace(/\s/g, '');
    if (!cleanedContact) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!/^\+\d{10,}$/.test(cleanedContact)) {
      newErrors.contactNumber = 'Invalid format (e.g., +6512345678, no spaces)';
    }

    if (formData.latitude === undefined || formData.longitude === undefined) {
      newErrors.location = isGeocoding ? 'Geocoding address...' : 'Address not geocoded. Please enter a valid address.';
    }

    setStoreErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveStore = async () => {
    if (!isManager) return;
    if (!validateStoreForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }
    setIsSaving(true);
    try {
      await updateStoreSettings({
        ...formData,
        contactNumber: (formData.contactNumber || '').replace(/\s/g, ''),
      });
      toast.success('Store settings updated successfully');
      setStoreErrors({});
    } catch (error) {
      toast.error('Failed to update store settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.username) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingUser) {
        if (userForm.password && !isPasswordValid(userForm.password)) {
          const unmet = getPasswordRequirements(userForm.password).find(r => !r.met);
          toast.error(`Password requirement not met: ${unmet?.label}`);
          return;
        }
        await updateUser(editingUser.id, userForm.password ? userForm : { ...userForm, password: undefined });
        toast.success('User updated successfully');
      } else {
        if (!userForm.password) {
          toast.error('Please set a password for the new user');
          return;
        }
        if (!isPasswordValid(userForm.password)) {
          const unmet = getPasswordRequirements(userForm.password).find(r => !r.met);
          toast.error(`Password requirement not met: ${unmet?.label}`);
          return;
        }
        await addUser(userForm);
        toast.success('New user added successfully');
      }

      setIsUserDialogOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteUser(id);
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Please enter both current and new password');
      return;
    }
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error('New password must be different');
      return;
    }
    if (!isPasswordValid(passwordForm.newPassword)) {
      const unmet = getPasswordRequirements(passwordForm.newPassword).find(r => !r.met);
      toast.error(`Password requirement not met: ${unmet?.label}`);
      return;
    }
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error('Failed to update password');
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.name || !profileForm.email) {
      toast.error('Please fill in name and email');
      return;
    }
    try {
      await updateProfile({ name: profileForm.name, email: profileForm.email });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Settings Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-[#1A1C18]">Settings</h1>
            <p className="text-gray-500">
              {isManager
                ? 'Manage store profile, team access, and security'
                : 'Manage your profile and account security'}
            </p>
          </div>
        </div>

        {isManager && (
          <Button
            onClick={handleSaveStore}
            disabled={isSaving}
            className="bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] px-8 gap-2 h-11 shadow-sm"
          >
            {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
          </Button>
        )}
      </div>

      <Tabs defaultValue={isManager ? "store" : "security"} className="space-y-6">
        <TabsList className="bg-white border p-1 rounded-[12px] h-12 shadow-sm inline-flex w-full sm:w-auto">
          {isManager && (
            <>
              <TabsTrigger value="store" className="rounded-[8px] px-6 gap-2 data-[state=active]:bg-[#4F6F52] data-[state=active]:text-white transition-all h-full">
                <Store className="w-4 h-4" /> Store Profile
              </TabsTrigger>
              <TabsTrigger value="team" className="rounded-[8px] px-6 gap-2 data-[state=active]:bg-[#4F6F52] data-[state=active]:text-white transition-all h-full">
                <Users className="w-4 h-4" /> Team Access
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="security" className="rounded-[8px] px-6 gap-2 data-[state=active]:bg-[#4F6F52] data-[state=active]:text-white transition-all h-full">
            <ShieldCheck className="w-4 h-4" /> Security & Profile
          </TabsTrigger>
        </TabsList>

        {/* Manager-only Store Profile Tab */}
        {isManager && (
          <TabsContent value="store" className="space-y-6">
            <Card className="rounded-[8px] border-gray-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-[#1A1C18]">
                  <Building2 className="w-5 h-5 text-[#4F6F52]" />
                  Store Profile Management
                </CardTitle>
                <CardDescription>Update corporate and operational identity for this outlet</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">StoreID (System-generated)</Label>
                      <Input value={formData.storeId} readOnly className="bg-gray-50 border-gray-200 rounded-[8px] font-mono text-xs text-gray-500 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">Company Name *</Label>
                      <Input
                        value={formData.companyName}
                        onChange={(e) => { setFormData({ ...formData, companyName: e.target.value }); setStoreErrors(prev => ({ ...prev, companyName: null })); }}
                        className={`rounded-[8px] border-gray-200 ${storeErrors.companyName ? 'border-red-400' : ''}`}
                      />
                      {storeErrors.companyName && <p className="text-xs text-red-500">{storeErrors.companyName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">UEN (Unique Entity Number) *</Label>
                      <Input
                        value={formData.uen}
                        onChange={(e) => { setFormData({ ...formData, uen: e.target.value }); setStoreErrors(prev => ({ ...prev, uen: null })); }}
                        className={`rounded-[8px] border-gray-200 ${storeErrors.uen ? 'border-red-400' : ''}`}
                      />
                      {storeErrors.uen && <p className="text-xs text-red-500">{storeErrors.uen}</p>}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">Store Name *</Label>
                      <Input
                        value={formData.storeName}
                        onChange={(e) => { setFormData({ ...formData, storeName: e.target.value }); setStoreErrors(prev => ({ ...prev, storeName: null })); }}
                        className={`rounded-[8px] border-gray-200 ${storeErrors.storeName ? 'border-red-400' : ''}`}
                      />
                      {storeErrors.storeName && <p className="text-xs text-red-500">{storeErrors.storeName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">Outlet Location (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input value={formData.outletLocation} onChange={(e) => setFormData({ ...formData, outletLocation: e.target.value })} className="pl-10 rounded-[8px] border-gray-200" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">Contact Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          value={formData.contactNumber}
                          onChange={(e) => { setFormData({ ...formData, contactNumber: e.target.value }); setStoreErrors(prev => ({ ...prev, contactNumber: null })); }}
                          className={`pl-10 rounded-[8px] border-gray-200 ${storeErrors.contactNumber ? 'border-red-400' : ''}`}
                          placeholder="e.g., +6512345678"
                        />
                      </div>
                      {storeErrors.contactNumber && <p className="text-xs text-red-500">{storeErrors.contactNumber}</p>}
                      <p className="text-xs text-gray-500">No spaces (e.g., +6512345678)</p>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Full Address *</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => { setFormData({ ...formData, address: e.target.value }); setStoreErrors(prev => ({ ...prev, address: null, location: null })); }}
                      className={`rounded-[8px] border-gray-200 ${storeErrors.address ? 'border-red-400' : ''}`}
                      placeholder="e.g., 1 Marina Blvd, Singapore"
                      disabled={isGeocoding}
                    />
                    {storeErrors.address && <p className="text-xs text-red-500">{storeErrors.address}</p>}
                  </div>

                  {isGeocoding && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 md:col-span-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Auto-geocoding address...
                    </div>
                  )}

                  {/* Location Coordinates Section */}
                  <div className="md:col-span-2 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="w-5 h-5 text-[#4F6F52]" />
                      <span className="text-sm font-bold text-gray-700">Location Coordinates (for Weather & Holidays)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Latitude</Label>
                        <Input
                          type="text"
                          placeholder="Auto-populated"
                          value={formData.latitude !== undefined ? formData.latitude.toFixed(6) : ''}
                          readOnly
                          className="rounded-[8px] border-gray-200 bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Longitude</Label>
                        <Input
                          type="text"
                          placeholder="Auto-populated"
                          value={formData.longitude !== undefined ? formData.longitude.toFixed(6) : ''}
                          readOnly
                          className="rounded-[8px] border-gray-200 bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Country Code (Auto-detected)</Label>
                        <Input
                          placeholder="Auto-detected from coordinates"
                          value={formData.countryCode ?? ''}
                          readOnly
                          className="rounded-[8px] border-gray-200 bg-gray-50 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    {storeErrors.location && <p className="text-xs text-red-500 mt-2">{storeErrors.location}</p>}
                    <p className="text-xs text-gray-500 mt-2">
                      Coordinates and country code are auto-populated when you enter an address above.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Manager-only Team Access Tab */}
        {isManager && (
          <TabsContent value="team" className="space-y-6">
            <Card className="rounded-[8px] border-gray-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b flex flex-row items-center justify-between p-6">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-[#1A1C18]">
                    <Users className="w-5 h-5 text-[#4F6F52]" />
                    Team Access Control
                  </CardTitle>
                  <CardDescription>Manage user permissions for your team members</CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setEditingUser(null);
                    setIsUserDialogOpen(true);
                  }}
                  className="bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] gap-2 px-6"
                >
                  <Plus className="w-4 h-4" /> Add New User
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-bold py-4 pl-6">User Info</TableHead>
                      <TableHead className="font-bold py-4">Role</TableHead>
                      <TableHead className="font-bold py-4">Status</TableHead>
                      <TableHead className="font-bold py-4 text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {storeUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-gray-50/30">
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-[#4F6F52]/10 text-[#4F6F52] text-xs font-bold">
                                {u.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{u.name}</p>
                              <p className="text-[11px] text-[#4F6F52] font-mono">@{u.username}</p>
                              <p className="text-[11px] text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`uppercase text-[10px] ${u.role === 'manager' ? 'border-[#4F6F52] text-[#4F6F52]' : ''}`}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-[10px] ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.status || 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditUser(u)} className="h-8 w-8 rounded-full hover:bg-[#4F6F52]/10">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Universal Security & Personal Profile Tab */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-[8px] border-gray-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-[#1A1C18]">
                  <Lock className="w-5 h-5 text-[#4F6F52]" />
                  Password Management
                </CardTitle>
                <CardDescription>Securely change your account password</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">Current Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="rounded-[8px] border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="rounded-[8px] border-gray-200"
                    maxLength={36}
                  />
                  {passwordForm.newPassword && (
                    <ul className="space-y-1 mt-1">
                      {getPasswordRequirements(passwordForm.newPassword).map((req) => (
                        <li key={req.label} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                          {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <Button
                  onClick={handleUpdatePassword}
                  className="w-full bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] h-11 shadow-sm mt-2"
                >
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[8px] border-gray-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-gray-50/50 border-b">
                <CardTitle className="text-xl flex items-center gap-2 text-[#1A1C18]">
                  <UserCircle className="w-5 h-5 text-[#4F6F52]" />
                  Personal Profile
                </CardTitle>
                <CardDescription>Update your personal contact information</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Full Name</Label>
                    <Input
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                      className="rounded-[8px] border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-gray-700">Email Address</Label>
                    <Input
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="rounded-[8px] border-gray-200"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSaveProfile}
                  className="w-full border-[#4F6F52] text-[#4F6F52] hover:bg-[#4F6F52]/5 rounded-[32px] h-11"
                >
                  Save Profile Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Management Dialog (Add/Edit) */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[12px] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1A1C18]">
              {editingUser ? 'Edit User Details' : 'Add New Team Member'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update this member's profile and outlet permissions."
                : "Enter details below to invite a new user to this store."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUserSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold flex justify-between">
                Username
                <span className="text-[10px] font-normal text-gray-400 uppercase tracking-widest">
                  {editingUser ? "Permanent ID" : "Unique Identifier"}
                </span>
              </Label>
              <Input
                id="username"
                placeholder="e.g. jason_tan88"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                className={`rounded-[8px] ${editingUser ? 'bg-gray-50 cursor-not-allowed opacity-80 italic' : ''}`}
                required
                disabled={!!editingUser}
              />
              {/* This paragraph now shows in both Add and Edit modes */}
              <p className="text-[10px] text-gray-400 italic px-1">
                {editingUser
                  ? "Usernames are permanent and cannot be modified."
                  : "Note: This username is permanent and cannot be changed once created."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={editingUser ? "Leave blank to keep current password" : "Set a temporary password (12-36 chars)"}
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="rounded-[8px]"
                required={!editingUser}
                maxLength={36}
              />
              {userForm.password && (
                <ul className="space-y-1 mt-1">
                  {getPasswordRequirements(userForm.password).map((req) => (
                    <li key={req.label} className={`flex items-center gap-1.5 text-xs ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                      {req.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {req.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. Tan Ah Kow"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="rounded-[8px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="rounded-[8px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Role</Label>
                <Select
                  value={userForm.role}
                  onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}
                >
                  <SelectTrigger className="rounded-[8px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">Status</Label>
                <Select
                  value={userForm.status}
                  onValueChange={(value: any) => setUserForm({ ...userForm, status: value })}
                >
                  <SelectTrigger className="rounded-[8px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-6 gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-[32px] flex-1">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" className="bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] flex-1">
                {editingUser ? 'Save Changes' : 'Create Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}