"use client";

import { useEffect, useState, FormEvent } from "react";
import { 
  Search, Plus, Image as ImageIcon, 
  Edit2, Loader2, X, AlertCircle
} from "lucide-react";
import { 
  fetchPublications, 
  createPublication, 
  updatePublication, 
  togglePublicationStatus,
  uploadImage
} from "./actions";

interface Publication {
  id: number;
  name: string;
  type: "NEWSPAPER" | "MAGAZINE";
  price: number;
  description: string;
  enabled: boolean;
  createdAt: string;
  imageUrl?: string;
  frequency?: string;
}

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPub, setEditingPub] = useState<Publication | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    type: "NEWSPAPER",
    price: "",
    frequency: "Daily",
    description: "",
    imageUrl: "",
    enabled: true
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPublications(search || undefined);
      setPublications(Array.isArray(data) ? data : []);
      setError("");
    } catch (err: any) {
      setError("Failed to load publications. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Debounced load
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]); // Re-fetch on search change

  const filteredPublications = publications.filter(pub => {
    if (filterType === "ALL") return true;
    return pub.type === filterType;
  });

  const openAddModal = () => {
    setEditingPub(null);
    setFormData({
      name: "",
      type: "NEWSPAPER",
      price: "",
      frequency: "Daily",
      description: "",
      imageUrl: "",
      enabled: true
    });
    setSelectedImageFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (pub: Publication) => {
    setEditingPub(pub);
    setFormData({
      name: pub.name,
      type: pub.type,
      price: pub.price.toString(),
      frequency: pub.type === "NEWSPAPER" ? "Daily" : (pub.frequency || "Monthly"),
      description: pub.description || "",
      imageUrl: pub.imageUrl || "",
      enabled: pub.enabled
    });
    setSelectedImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImageFile(null);
  };

  const handleToggleStatus = async (pub: Publication) => {
    try {
      // Optimistic update
      setPublications(pubs => pubs.map(p => p.id === pub.id ? { ...p, enabled: !p.enabled } : p));
      await togglePublicationStatus(pub.id, !pub.enabled);
    } catch (err) {
      // Revert on error
      setPublications(pubs => pubs.map(p => p.id === pub.id ? { ...p, enabled: pub.enabled } : p));
      setError("Failed to change status.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      let finalImageUrl = formData.imageUrl;

      if (selectedImageFile) {
        const fileData = new FormData();
        fileData.append("file", selectedImageFile);
        const res = await uploadImage(fileData);
        if (res.url) {
          finalImageUrl = res.url;
        }
      }

      // Build payload mapping local state
      const payload = {
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price),
        description: formData.description || undefined,
        imageUrl: finalImageUrl || undefined
      };

      if (editingPub) {
        await updatePublication(editingPub.id, payload);
      } else {
        await createPublication(payload);
      }
      setIsModalOpen(false);
      setSelectedImageFile(null);
      loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to save publication.");
    } finally {
        setIsSubmitting(false);
    }
  };

  // Helper for type change to reset frequency
  const handleTypeChange = (type: string) => {
    setFormData({
      ...formData,
      type,
      frequency: type === "NEWSPAPER" ? "Daily" : "Weekly"
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-gray-900">Publications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage newspaper and magazine listings.</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.1)] active:scale-95"
        >
          <Plus className="h-4 w-4 mr-2" strokeWidth={2} />
          Add Publication
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl flex items-center text-sm border border-rose-100">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Controls: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF]">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm outline-none transition-all placeholder:text-gray-400"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-50/50 border border-transparent focus:border-gray-200 focus:bg-white rounded-xl text-sm text-gray-700 outline-none transition-all cursor-pointer min-w-[140px]"
        >
          <option value="ALL">All Types</option>
          <option value="NEWSPAPER">Newspapers</option>
          <option value="MAGAZINE">Magazines</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#EFEFEF] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-[#FBFBFD] border-b border-[#EFEFEF] text-gray-400 font-medium">
              <tr>
                <th className="px-6 py-4 font-medium w-16">Image</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Image Link</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Frequency</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFEF]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" strokeWidth={1.5} />
                    <span>Loading publications...</span>
                  </td>
                </tr>
              ) : filteredPublications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-gray-300" />
                    </div>
                    <span>No publications found.</span>
                  </td>
                </tr>
              ) : (
                filteredPublications.map((pub) => (
                  <tr key={pub.id} className="hover:bg-[#FBFBFD] transition-colors group">
                    <td className="px-6 py-3">
                      {pub.imageUrl ? (
                        <img 
                          src={pub.imageUrl} 
                          alt={pub.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                           <ImageIcon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{pub.name}</div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="max-w-[150px] truncate text-gray-500" title={pub.imageUrl || "No link"}>
                        {pub.imageUrl ? (
                          <a href={pub.imageUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                            {pub.imageUrl}
                          </a>
                        ) : (
                          "None"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="capitalize">{pub.type.toLowerCase()}</span>
                    </td>
                    <td className="px-6 py-3">
                      {pub.type === "NEWSPAPER" ? "Daily" : (pub.frequency || "Monthly")}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      ₹{pub.price?.toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${
                        pub.enabled 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100/50" 
                          : "bg-gray-50 text-gray-500 border-gray-200/50"
                      }`}>
                        {pub.enabled ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(pub)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit Publication"
                        >
                          <Edit2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(pub)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            pub.enabled 
                              ? "text-gray-400 hover:text-amber-600 hover:bg-amber-50" 
                              : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={pub.enabled ? "Disable Publication" : "Enable Publication"}
                        >
                          <span className="text-xs font-medium px-1.5">
                            {pub.enabled ? "Disable" : "Enable"}
                          </span>
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

      {/* Modal - Render conditionally inside portal or inline for simplicity */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={closeModal} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 tracking-tight">
                {editingPub ? "Edit Publication" : "Add Publication"}
              </h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1.5 rounded-full transition-colors outline-none"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-5">
                
                {/* Cover Image Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Cover Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-dashed border-gray-300 flex flex-shrink-0 items-center justify-center overflow-hidden">
                       {(selectedImageFile || formData.imageUrl) ? (
                         <img 
                           src={selectedImageFile ? URL.createObjectURL(selectedImageFile) : formData.imageUrl} 
                           alt="Preview" 
                           className="w-full h-full object-cover" 
                         />
                       ) : (
                         <ImageIcon className="h-5 w-5 text-gray-400" strokeWidth={1} />
                       )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedImageFile(e.target.files[0]);
                          }
                        }}
                        className="w-full text-sm outline-none transition-all text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-gray-200 file:text-sm file:font-medium file:bg-white file:text-gray-700 hover:file:bg-gray-50 file:cursor-pointer file:shadow-sm"
                      />
                    </div>
                  </div>
                  {formData.imageUrl && !selectedImageFile && (
                    <p className="mt-2 text-[10px] text-gray-400 truncate w-full" title={formData.imageUrl}>
                      Current: {formData.imageUrl}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Publication Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. The Morning Times"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all cursor-pointer"
                    >
                      <option value="NEWSPAPER">Newspaper</option>
                      <option value="MAGAZINE">Magazine</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Frequency</label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      disabled={formData.type === "NEWSPAPER"}
                      className={`w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none transition-all cursor-pointer ${
                        formData.type === "NEWSPAPER" ? "bg-gray-50 text-gray-400" : "bg-white focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                      }`}
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly" disabled={formData.type === "NEWSPAPER"}>Weekly</option>
                      <option value="Monthly" disabled={formData.type === "NEWSPAPER"}>Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Monthly Price (₹) *</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter publication description..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 resize-none"
                  />
                </div>

              </div>

              <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-black rounded-xl transition-all ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.1)] active:scale-95"
                  }`}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingPub ? "Save Changes" : "Create Publication"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
