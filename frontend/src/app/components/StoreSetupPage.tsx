import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { ChefHat, MapPin, Building2, Store, Loader2 } from 'lucide-react';
import { useApp } from '@/app/context/AppContext';
import { toast } from 'sonner';
import { geocodeAddress, reverseGeocodeCoordinates } from '@/app/services/geocoding';

export function StoreSetupPage() {
  const { setupStore, user } = useApp();
  const [companyName, setCompanyName] = useState('');
  const [uen, setUen] = useState('');
  const [storeName, setStoreName] = useState('');
  const [outletLocation, setOutletLocation] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [countryCode, setCountryCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const autoGeocode = useCallback(async (addr: string) => {
    if (!addr.trim()) {
      setLatitude(undefined);
      setLongitude(undefined);
      setErrors(prev => ({ ...prev, location: null }));
      return;
    }
    setIsGeocoding(true);
    setErrors(prev => ({ ...prev, location: null }));
    try {
      const coords = await geocodeAddress(addr);
      if (coords) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
        setErrors(prev => ({ ...prev, location: null }));
      } else {
        setLatitude(undefined);
        setLongitude(undefined);
        toast.error('Could not auto-geocode address. Please try a different address.');
        setErrors(prev => ({ ...prev, location: 'Could not resolve address to coordinates' }));
      }
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      autoGeocode(address);
    }, 500);
    return () => clearTimeout(handler);
  }, [address, autoGeocode]);

  useEffect(() => {
    const fetchCountryCode = async () => {
      if (latitude !== undefined && longitude !== undefined) {
        const code = await reverseGeocodeCoordinates(latitude, longitude);
        setCountryCode(code || '');
      } else {
        setCountryCode('');
      }
    };
    fetchCountryCode();
  }, [latitude, longitude]);

  const validateForm = () => {
    const newErrors: { [key: string]: string | null } = {};
    if (!companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!uen.trim()) newErrors.uen = 'UEN is required';
    if (!storeName.trim()) newErrors.storeName = 'Store Name is required';
    if (!address.trim()) newErrors.address = 'Full Address is required';

    const cleanedContact = contactNumber.replace(/\s/g, '');
    if (!cleanedContact) {
      newErrors.contactNumber = 'Contact Number is required';
    } else if (!/^\+\d{10,}$/.test(cleanedContact)) {
      newErrors.contactNumber = 'Invalid format (e.g., +6512345678, no spaces)';
    }

    if (latitude === undefined || longitude === undefined) {
      newErrors.location = isGeocoding ? 'Geocoding address...' : 'Address not geocoded. Please enter a valid address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please correct the errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      await setupStore({
        companyName,
        uen,
        storeName,
        outletLocation: outletLocation || undefined,
        address,
        contactNumber: contactNumber.replace(/\s/g, ''),
        latitude,
        longitude,
        countryCode: countryCode || undefined,
      });
      toast.success('Store setup complete!');
    } catch (err) {
      toast.error('Failed to set up store.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FBF7] p-4">
      <Card className="w-full max-w-2xl shadow-lg rounded-[8px]">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="bg-[#4F6F52] p-4 rounded-full shadow-md">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl text-[#1A1C18]">Welcome, {user?.name}!</CardTitle>
          <CardDescription className="text-[#6b7280]">
            Let's set up your store to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Store Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#4F6F52] font-medium">
                  <Store className="w-5 h-5" />
                  <span>Store Information</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name *</Label>
                  <Input
                    id="storeName"
                    type="text"
                    placeholder="e.g., SmartSus Kitchen"
                    value={storeName}
                    onChange={(e) => { setStoreName(e.target.value); setErrors(prev => ({ ...prev, storeName: null })); }}
                    className={`rounded-[8px] ${errors.storeName ? 'border-red-400' : ''}`}
                  />
                  {errors.storeName && <p className="text-xs text-red-500">{errors.storeName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="e.g., SmartSus Pte Ltd"
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value); setErrors(prev => ({ ...prev, companyName: null })); }}
                    className={`rounded-[8px] ${errors.companyName ? 'border-red-400' : ''}`}
                  />
                  {errors.companyName && <p className="text-xs text-red-500">{errors.companyName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uen">UEN (Unique Entity Number) *</Label>
                  <Input
                    id="uen"
                    type="text"
                    placeholder="e.g., 202012345A"
                    value={uen}
                    onChange={(e) => { setUen(e.target.value); setErrors(prev => ({ ...prev, uen: null })); }}
                    className={`rounded-[8px] ${errors.uen ? 'border-red-400' : ''}`}
                  />
                  {errors.uen && <p className="text-xs text-red-500">{errors.uen}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="text"
                    placeholder="e.g., +6512345678"
                    value={contactNumber}
                    onChange={(e) => { setContactNumber(e.target.value); setErrors(prev => ({ ...prev, contactNumber: null })); }}
                    className={`rounded-[8px] ${errors.contactNumber ? 'border-red-400' : ''}`}
                  />
                  {errors.contactNumber && <p className="text-xs text-red-500">{errors.contactNumber}</p>}
                  <p className="text-xs text-gray-500">No spaces (e.g., +6512345678)</p>
                </div>
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#4F6F52] font-medium">
                  <MapPin className="w-5 h-5" />
                  <span>Location Details</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outletLocation">Outlet Location (Optional)</Label>
                  <Input
                    id="outletLocation"
                    type="text"
                    placeholder="e.g., Orchard Road Branch"
                    value={outletLocation}
                    onChange={(e) => setOutletLocation(e.target.value)}
                    className="rounded-[8px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="e.g., 1 Marina Blvd, Singapore"
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: null, location: null })); }}
                    className={`rounded-[8px] ${errors.address ? 'border-red-400' : ''}`}
                    disabled={isGeocoding}
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                </div>

                {isGeocoding && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Auto-geocoding address...
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="text"
                      placeholder="Auto-populated"
                      value={latitude !== undefined ? latitude.toFixed(6) : ''}
                      readOnly
                      className="rounded-[8px] bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="text"
                      placeholder="Auto-populated"
                      value={longitude !== undefined ? longitude.toFixed(6) : ''}
                      readOnly
                      className="rounded-[8px] bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country Code (Auto-detected)</Label>
                  <Input
                    id="countryCode"
                    type="text"
                    placeholder="Auto-detected from coordinates"
                    value={countryCode}
                    readOnly
                    className="rounded-[8px] bg-gray-50 cursor-not-allowed"
                  />
                </div>
                {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] h-12 gap-2 text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Setting up store...' : (
                <>
                  <Building2 className="w-5 h-5" />
                  Complete Store Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
