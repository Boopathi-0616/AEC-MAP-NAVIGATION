import React, { useState, useEffect } from 'react';
import { Place, PlaceCategory, LocationStatus, CrowdLevel, Coordinates } from '../../types';
import { campusDataService } from '../../services/campusDataService';
import { X, Save, Trash2, MapPin, Building, Clock, Users, AlertCircle, Check } from 'lucide-react';

interface LocationEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeToEdit?: Place | null;
  newPinCoordinates?: Coordinates | null;
  onSaved: (savedPlace: Place) => void;
  onDeleted?: (placeId: string) => void;
}

const CATEGORIES: { id: PlaceCategory; label: string }[] = [
  { id: 'academic', label: 'Academic Wing' },
  { id: 'department', label: 'Department Block' },
  { id: 'library', label: 'Library & Knowledge Center' },
  { id: 'food', label: 'Food & Canteen' },
  { id: 'hostel', label: 'Student Hostel' },
  { id: 'sports', label: 'Sports & Athletics' },
  { id: 'administration', label: 'Administration' },
  { id: 'facilities', label: 'Campus Facilities' },
  { id: 'parking', label: 'Parking Area' },
  { id: 'emergency', label: 'Emergency & Security' },
  { id: 'medical', label: 'Medical Health Clinic' },
];

export const LocationEditorModal: React.FC<LocationEditorModalProps> = ({
  isOpen,
  onClose,
  placeToEdit,
  newPinCoordinates,
  onSaved,
  onDeleted,
}) => {
  const isEditing = Boolean(placeToEdit);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('academic');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('Ground Floor');
  const [shortDescription, setShortDescription] = useState('');
  const [coordX, setCoordX] = useState<number>(50);
  const [coordY, setCoordY] = useState<number>(50);
  const [lat, setLat] = useState<number>(12.2281);
  const [lng, setLng] = useState<number>(79.0745);
  const [statusOverride, setStatusOverride] = useState<'auto' | LocationStatus>('auto');
  const [crowdOverride, setCrowdOverride] = useState<'auto' | CrowdLevel>('auto');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('17:00');
  const [temporaryNotice, setTemporaryNotice] = useState('');
  const [crowdRecommendation, setCrowdRecommendation] = useState('');
  const [amenitiesString, setAmenitiesString] = useState('Wi-Fi, Restrooms, Wheelchair Access');
  const [contactPhone, setContactPhone] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (placeToEdit) {
      setName(placeToEdit.name);
      setCategory(placeToEdit.category);
      setBuilding(placeToEdit.building);
      setFloor(placeToEdit.floor || 'Ground Floor');
      setShortDescription(placeToEdit.shortDescription);
      setCoordX(placeToEdit.coordinates.x);
      setCoordY(placeToEdit.coordinates.y);
      setLat(placeToEdit.coordinates.lat);
      setLng(placeToEdit.coordinates.lng);
      setStatusOverride(placeToEdit.statusOverride || 'auto');
      setCrowdOverride(placeToEdit.crowdOverride || 'auto');
      setOpeningTime(placeToEdit.openingTime || '08:00');
      setClosingTime(placeToEdit.closingTime || '17:00');
      setTemporaryNotice(placeToEdit.temporaryNotice || '');
      setCrowdRecommendation(placeToEdit.crowdRecommendation || '');
      setAmenitiesString(placeToEdit.amenities?.join(', ') || '');
      setContactPhone(placeToEdit.contactPhone || '');
    } else if (newPinCoordinates) {
      setName('');
      setCategory('academic');
      setBuilding('New Campus Wing');
      setFloor('Ground Floor');
      setShortDescription('Campus facility or department location.');
      setCoordX(newPinCoordinates.x);
      setCoordY(newPinCoordinates.y);
      setLat(newPinCoordinates.lat);
      setLng(newPinCoordinates.lng);
      setStatusOverride('auto');
      setCrowdOverride('auto');
      setOpeningTime('08:00');
      setClosingTime('17:00');
      setTemporaryNotice('');
      setCrowdRecommendation('');
      setAmenitiesString('Wi-Fi, Restrooms');
      setContactPhone('');
    }
  }, [placeToEdit, newPinCoordinates, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const amenities = amenitiesString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditing && placeToEdit) {
      const updated = campusDataService.updatePlace(placeToEdit.id, {
        name,
        category,
        building,
        floor,
        shortDescription,
        coordinates: { x: coordX, y: coordY, lat, lng },
        statusOverride,
        crowdOverride,
        openingTime,
        closingTime,
        temporaryNotice: temporaryNotice.trim() || undefined,
        crowdRecommendation: crowdRecommendation.trim() || undefined,
        amenities,
        contactPhone: contactPhone.trim() || undefined,
      });
      if (updated) {
        onSaved(updated);
        onClose();
      }
    } else {
      const created = campusDataService.addPlace({
        name,
        category,
        building,
        floor,
        shortDescription,
        coordinates: { x: coordX, y: coordY, lat, lng },
        statusOverride,
        crowdOverride,
        openingTime,
        closingTime,
        temporaryNotice: temporaryNotice.trim() || undefined,
        crowdRecommendation: crowdRecommendation.trim() || undefined,
        amenities,
        contactPhone: contactPhone.trim() || undefined,
      });
      onSaved(created);
      onClose();
    }
  };

  const handleDelete = () => {
    if (!placeToEdit) return;
    const ok = campusDataService.deletePlace(placeToEdit.id);
    if (ok) {
      onDeleted?.(placeToEdit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#FFFDF8] rounded-3xl border border-[#C9A45C]/40 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 box-border">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#651C32] text-white flex items-center justify-between border-b border-[#C9A45C]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#461323] border border-[#C9A45C]/40 flex items-center justify-center shadow-xs">
              <MapPin className="w-5 h-5 text-[#C9A45C]" />
            </div>
            <div>
              <span className="text-[9px] font-bold tracking-widest uppercase text-[#C9A45C] block">
                CAMPUS LOCATION EDITOR
              </span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight">
                {isEditing ? `Edit: ${placeToEdit?.name}` : 'Create New Location'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Location Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Location Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Central Library"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Building & Floor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Building Block *
              </label>
              <input
                type="text"
                required
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                placeholder="e.g. Dr. APJ Abdul Kalam Block"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Floor / Wing
              </label>
              <input
                type="text"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                placeholder="e.g. Ground Floor, Wing B"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* Real-time Status & Crowd Controls */}
          <div className="p-3.5 rounded-2xl bg-[#F7F1E5] border border-[#E8DFD3] space-y-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#651C32] block">
              LIVE STATUS & TELEMETRY CONTROLS
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[#75666A] uppercase block mb-1">
                  Location Status
                </label>
                <select
                  value={statusOverride}
                  onChange={(e) => setStatusOverride(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E8DFD3] rounded-lg text-xs font-semibold text-[#241B1E] focus:outline-none"
                >
                  <option value="auto">Auto (Follows Hours)</option>
                  <option value="open">🟢 Force OPEN</option>
                  <option value="closed">⚪ Force CLOSED</option>
                  <option value="busy">🟡 Force BUSY</option>
                  <option value="temporarily-closed">🟠 Temporarily Closed</option>
                  <option value="maintenance">🔧 Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#75666A] uppercase block mb-1">
                  Crowd Density
                </label>
                <select
                  value={crowdOverride}
                  onChange={(e) => setCrowdOverride(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E8DFD3] rounded-lg text-xs font-semibold text-[#241B1E] focus:outline-none"
                >
                  <option value="auto">Auto (Follows Schedule)</option>
                  <option value="low">🟢 LOW Crowd</option>
                  <option value="medium">🟡 MEDIUM Crowd</option>
                  <option value="high">🔴 HIGH Crowd (Rush)</option>
                </select>
              </div>
            </div>

            {/* Opening & Closing Hours */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-[#75666A] uppercase block mb-1">
                  Opening Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E8DFD3] rounded-lg text-xs font-semibold text-[#241B1E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-[#75666A] uppercase block mb-1">
                  Closing Time (HH:mm)
                </label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#E8DFD3] rounded-lg text-xs font-semibold text-[#241B1E] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Temporary Notice & Advisory */}
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Temporary Notice / Alert (Optional)
              </label>
              <input
                type="text"
                value={temporaryNotice}
                onChange={(e) => setTemporaryNotice(e.target.value)}
                placeholder="e.g. Lunch rush expected between 12:45 - 1:30 PM"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Crowd Recommendation Advisory (Optional)
              </label>
              <input
                type="text"
                value={crowdRecommendation}
                onChange={(e) => setCrowdRecommendation(e.target.value)}
                placeholder="e.g. Try visiting after 2:15 PM for shorter queues."
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
              />
            </div>
          </div>

          {/* Short Description */}
          <div>
            <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
              Short Description *
            </label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Summary of research labs, departments or services..."
              className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none focus:border-[#C9A45C]"
            />
          </div>

          {/* Coordinates (x, y & GPS) */}
          <div className="grid grid-cols-4 gap-2 bg-[#FAF6EE] p-3 rounded-xl border border-[#E8DFD3]">
            <div>
              <span className="text-[9px] font-bold text-[#75666A] block">Grid X (0-100)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={coordX}
                onChange={(e) => setCoordX(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-bold bg-white border border-[#E8DFD3] rounded"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#75666A] block">Grid Y (0-100)</span>
              <input
                type="number"
                min={0}
                max={100}
                value={coordY}
                onChange={(e) => setCoordY(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-bold bg-white border border-[#E8DFD3] rounded"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#75666A] block">Latitude</span>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#E8DFD3] rounded"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#75666A] block">Longitude</span>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="w-full px-2 py-1 text-xs font-mono bg-white border border-[#E8DFD3] rounded"
              />
            </div>
          </div>

          {/* Amenities & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                value={amenitiesString}
                onChange={(e) => setAmenitiesString(e.target.value)}
                placeholder="Wi-Fi, Air Conditioning, Elevator"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#651C32] uppercase tracking-wider block mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 4175 255100"
                className="w-full px-3 py-2 bg-white border border-[#E8DFD3] rounded-xl text-xs text-[#241B1E] focus:outline-none"
              />
            </div>
          </div>

          {/* Actions Footer inside form */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#E8DFD3]">
            {isEditing && (
              <div>
                {!showConfirmDelete ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(true)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-2 py-1.5 text-xs text-[#75666A] hover:text-[#241B1E]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E8DFD3] text-xs font-semibold text-[#75666A] hover:text-[#241B1E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#651C32] hover:bg-[#461323] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-[#C9A45C]/40 transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#C9A45C]" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
