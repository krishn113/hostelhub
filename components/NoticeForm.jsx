"use client";
import { useState, useRef } from "react";
import API from "@/lib/api";

export default function NoticeForm({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Events");
  const [links, setLinks] = useState([{ label: "", url: "" }]);
  const [attachments, setAttachments] = useState([]); // Array of File objects
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const addLinkField = () => setLinks([...links, { label: "", url: "" }]);
  const removeLinkField = (index) => {
    const updatedLinks = links.filter((_, i) => i !== index);
    setLinks(updatedLinks);
  };

  const handleLinkChange = (index, field, value) => {
    const updatedLinks = [...links];
    updatedLinks[index][field] = value;
    setLinks(updatedLinks);
  };

  // --- Attachment Logic ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
   try {
      // Use FormData because we are sending files
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      
      // Append filtered links as a stringified array
      const validLinks = links.filter((l) => l.url !== "");
      formData.append("links", JSON.stringify(validLinks));

      // Append all files
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      await API.post("/notices", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Notice published!");
      onSuccess?.(); // Refresh the list in the background
      onClose();     // Close the modal
      resetForm();
    } catch (err) {
      alert("Failed to post notice");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setLinks([{ label: "", url: "" }]);
    setAttachments([]);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Create New Notice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Notice Title</label>
            <input 
              required 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
            <textarea 
              required 
              rows="4" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {["Maintenance", "Events", "Other"].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Attachments (Images/PDFs)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button type="button" onClick={() => removeAttachment(idx)} className="text-indigo-400 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,.pdf"
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-sm hover:bg-slate-50 transition"
            >
              + Upload Files
            </button>
          </div>

          {/* Links Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">External Links</label>
            {links.map((link, index) => (
              <div key={index} className="flex gap-2 mb-3 items-center">
                <input 
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                  placeholder="Label" 
                  value={link.label}
                  onChange={(e) => handleLinkChange(index, "label", e.target.value)}
                />
                <input 
                  className="flex-[2] p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                  placeholder="URL" 
                  value={link.url}
                  onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                />
                {links.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeLinkField(index)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLinkField} className="text-indigo-600 text-sm font-bold">+ Add another link</button>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Notice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}