import { useFormStore } from "../store/context";
import { useEffect, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { FaChevronDown, FaCheck, FaLayerGroup, FaSave } from "react-icons/fa";
import api from "../api";

const EditForm = ({ formId, onCancel }) => {
  const { state, dispatch } = useFormStore();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const foundForm = state.forms.find((f) => f.id === formId);
    
    if (foundForm) {
      setForm(foundForm);
      // Initialize formData with empty values for all fields
      const initialData = {};
      
      // Add safety check here
      if (Array.isArray(foundForm.schema)) {
        foundForm.schema.forEach((section) => {
          if (Array.isArray(section.fields)) {
            section.fields.forEach((field) => {
              initialData[field.id] = "";
            });
          }
        });
      }
      
      setFormData(initialData);
      setLoading(false);
    } else {
      // Handle form not found
      setLoading(false);
    }
  }, [state.forms, formId]);

  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
    // Clear error for this field if it exists
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    form.schema?.forEach((section) => {
      section.fields?.forEach((field) => {
        if (field.required && !formData[field.id]) {
          newErrors[field.id] = "This field is required";
          isValid = false;
        }
      });
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert("Please fill in all required fields");
      return;
    }

    const submissionData = {
      formId: form.id,
      formName: form.name,
      category: form.category,
      responses: formData,
      submittedAt: new Date().toISOString(),
    };

    api.post("http://127.0.0.1:8000/api/form-submissions/", submissionData)
      .then((res) => {
        console.log("Form submitted:", res);
        alert("Form submitted successfully!");
        // Reset form
        const resetData = {};
        form.schema?.forEach((section) => {
          section.fields?.forEach((field) => {
            resetData[field.id] = "";
          });
        });
        setFormData(resetData);
      })
      .catch((err) => {
        console.error("Error submitting form:", err);
        alert("Failed to submit form. Please try again.");
      });
  };

  const handleSaveAsDraft = () => {
    const draftData = {
      formId: form.id,
      formName: form.name,
      category: form.category,
      responses: formData,
      status: "draft",
      savedAt: new Date().toISOString(),
    };

    api.post("http://127.0.0.1:8000/api/form-drafts/", draftData)
      .then((res) => {
        console.log("Draft saved:", res);
        alert("Form saved as draft successfully!");
      })
      .catch((err) => {
        console.error("Error saving draft:", err);
        alert("Failed to save draft. Please try again.");
      });
  };

  const renderField = (field) => {
    const baseInputClass = `border rounded-md p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      errors[field.id] ? "border-red-500" : "border-gray-300"
    }`;
    const value = formData[field.id] || "";

    switch (field.type) {
      case "text":
        return (
          <input
            className={baseInputClass}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            className={baseInputClass}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "email":
        return (
          <input
            type="email"
            className={baseInputClass}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "phone":
        return (
          <input
            type="tel"
            className={baseInputClass}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "date":
        return (
          <input
            type="date"
            className={baseInputClass}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "textarea":
        return (
          <textarea
            className={`${baseInputClass} min-h-[100px] resize-y`}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              className="hidden"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleFieldChange(field.id, file.name);
                }
              }}
            />
            <label htmlFor={field.id} className="cursor-pointer text-gray-600">
              {value ? `Selected: ${value}` : "Click to upload or drag and drop"}
            </label>
          </div>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              className="w-4 h-4 text-blue-600"
              checked={value === "true" || value === true}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
            />
            <label htmlFor={field.id} className="text-sm text-gray-700">
              {field.placeholder || "Check this option"}
            </label>
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.filter(opt => opt.trim()).map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  id={`${field.id}_${idx}`}
                  className="w-4 h-4 text-blue-600"
                  checked={value === option}
                  onChange={() => handleFieldChange(field.id, option)}
                />
                <label htmlFor={`${field.id}_${idx}`} className="text-sm text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      case "dropdown":
        return (
          <Select.Root value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <Select.Trigger className={`${baseInputClass} flex justify-between items-center`}>
              <Select.Value placeholder="Select option" />
              <Select.Icon>
                <FaChevronDown size={12} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Content
              position="popper"
              className="border bg-white rounded-md shadow-lg z-50 w-full"
              sideOffset={5}
            >
              <Select.Viewport>
                {field.options?.filter(opt => opt.trim()).map((option, idx) => (
                  <Select.Item
                    key={idx}
                    value={option}
                    className="p-3 hover:bg-slate-100 cursor-pointer flex items-center"
                  >
                    <Select.ItemText>{option}</Select.ItemText>
                    <Select.ItemIndicator className="ml-auto">
                      <FaCheck size={12} />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Root>
        );
      default:
        return (
          <input
            className={baseInputClass}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
          />
        );
    }
  };



  if (loading || !form) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }
 

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{form.name || "Untitled Form"}</h1>
            {form.description && (
              <p className="text-gray-600 mt-1">{form.description}</p>
            )}
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {form.category?.toUpperCase() || "GENERAL"}
              </span>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <form className="space-y-8" onSubmit={handleSubmit}>
          {Array.isArray(form.schema) && form.schema.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {sectionIndex + 1}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.name}</h2>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Fields */}
              <div className="p-6">
                {section.fields?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FaLayerGroup size={24} className="mx-auto mb-2 opacity-50" />
                    <p>No fields in this section</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.fields?.map((field) => {
                      const fullWidthFields = ["textarea", "file"];
                      const isFullWidth = fullWidthFields.includes(field.type);

                      return (
                        <div
                          key={field.id}
                          className={`space-y-2 ${
                            isFullWidth ? "md:col-span-2 lg:col-span-3" : ""
                          }`}
                        >
                          <label className="block text-sm font-medium text-gray-700">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {renderField(field)}
                          {errors[field.id] && (
                            <p className="text-xs text-red-500 mt-1">{errors[field.id]}</p>
                          )}
                          {field.type === "file" && !errors[field.id] && (
                            <p className="text-xs text-gray-500 mt-1">
                              Supported formats: PDF, JPG, PNG (Max 5MB)
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-end space-x-4">
            <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAsDraft}
                className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Save as Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
              >
                <FaSave size={14} />
                Submit Form
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm;