"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, X, Pencil, Trash2 } from "lucide-react";
import { fetchHubsAction, deleteHubAction, saveHubAction } from "./actions";
import MapPicker from "@/components/maps/MapPicker";
import AddressSearch from "@/components/maps/AddressSearch";

interface Hub {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  active: boolean;
  createdAt: string;
}

export default function HubsPage() {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<Hub | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    active: true,
  });

  const fetchHubs = async () => {
    try {
      const data = await fetchHubsAction();
      setHubs(data);
    } catch (error) {
      console.error("Error fetching hubs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  const openModalForNew = () => {
    setEditingHub(null);
    setFormData({ name: "", address: "", latitude: 0, longitude: 0, active: true });
    setIsModalOpen(true);
  };

  const openModalForEdit = (hub: Hub) => {
    setEditingHub(hub);
    setFormData({
      name: hub.name,
      address: hub.address,
      latitude: hub.latitude,
      longitude: hub.longitude,
      active: hub.active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Hub?")) return;
    
    try {
      await deleteHubAction(id);
      fetchHubs();
    } catch (error) {
      console.error("Error deleting hub:", error);
      alert("Failed to delete hub. It might be in use.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = editingHub ? { ...formData, id: editingHub.id } : formData;
      await saveHubAction(payload, !!editingHub);
      setIsModalOpen(false);
      fetchHubs();
    } catch (error) {
      console.error("Error saving hub:", error);
      alert("Failed to save hub. Please verify all fields are valid.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-[#EFEFEF]">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Delivery Hubs</h2>
          <p className="text-sm text-gray-500 mt-1">Manage physical pickup locations for delivery operations</p>
        </div>
        <button
          onClick={openModalForNew}
          className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-black/10 flex items-center space-x-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Hub</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#EFEFEF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FBFBFD] border-b border-[#EFEFEF]">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hub Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordinates (Lat, Lng)</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {hubs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm">No hubs found. Add your first delivery hub.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                hubs.map((hub) => (
                  <tr key={hub.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{hub.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-sm">{hub.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-sm font-mono border border-gray-100">
                        {hub.latitude.toFixed(6)}, {hub.longitude.toFixed(6)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        hub.active ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20" : "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20"
                      }`}>
                        {hub.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openModalForEdit(hub)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hub.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">{editingHub ? "Edit Hub" : "Add New Hub"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Hub Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-black transition-colors"
                  placeholder="e.g. North Vijayawada Hub"
                />
              </div>

              <div className="space-y-1.5 z-20 relative">
                <label className="text-sm font-medium text-gray-700">Complete Address</label>
                <AddressSearch
                  defaultValue={formData.address}
                  onSelectAddress={(address, lat, lng) => {
                    setFormData(prev => ({ ...prev, address, latitude: lat, longitude: lng }));
                  }}
                  onInputChange={(val) => setFormData(prev => ({ ...prev, address: val }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-mono border border-gray-200 outline-none focus:border-black transition-colors"
                    placeholder="16.498308"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm font-mono border border-gray-200 outline-none focus:border-black transition-colors"
                    placeholder="80.657703"
                  />
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                <MapPicker
                    lat={formData.latitude || 16.5062}
                    lng={formData.longitude || 80.6480}
                    onLocationChange={(lat, lng, address) => {
                      setFormData((prev) => ({
                        ...prev,
                        latitude: lat,
                        longitude: lng,
                        ...(address && !prev.address ? { address } : {})
                      }));
                    }}
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black cursor-pointer"
                  />
                </div>
                <label className="text-sm font-medium text-gray-700">
                  Hub is currently active and operational
                </label>
              </div>

              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-100 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-black/10 active:scale-[0.98]"
                >
                  {editingHub ? "Save Changes" : "Create Hub"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
