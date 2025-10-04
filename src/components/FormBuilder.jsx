import React, { useState } from "react";
import * as Select from "@radix-ui/react-select";
import * as Switch from "@radix-ui/react-switch";
import * as Dialog from "@radix-ui/react-dialog";
import {
    FaPlus,
    FaTrash,
    FaGripVertical,
    FaEye,
    FaSave,
    FaCog,
    FaChevronDown,
    FaCheck,
    FaLayerGroup
  } from "react-icons/fa";
import axios from "axios";
import { useFormStore } from "../store/context";
import api from "../api";
import {toast, ToastContainer} from 'react-toastify';


export default function FormBuilder() {
  const [formConfig, setFormConfig] = useState({
    name: "",
    description: "",
    category: "kyc",
    schema: [
      {
        id: "default_section",
        name: "General Information",
        description: "Basic form fields",
        fields: []
      }
    ],
    
  });

  const [previewMode, setPreviewMode] = useState(false);
  

  const { state, dispatch } = useFormStore();

  const notify = (message="Form Saved Successfully") => toast(message,{
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    type: "success",

  });

  const notifyError = (message="Form Saved Failed") => toast(message,{
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    type: "error",

  });

  const fieldTypes = [
    { value: "text", label: "Text Input", icon: "📝" },
    { value: "number", label: "Number", icon: "🔢" },
    { value: "email", label: "Email", icon: "📧" },
    { value: "phone", label: "Phone", icon: "📞" },
    { value: "date", label: "Date", icon: "📅" },
    { value: "dropdown", label: "Dropdown", icon: "📋" },
    { value: "checkbox", label: "Checkbox", icon: "☑️" },
    { value: "radio", label: "Radio Group", icon: "🔘" },
    { value: "file", label: "File Upload", icon: "📎" },
    { value: "textarea", label: "Long Text", icon: "📄" },
  ];

  const categoryOptions = [
    { value: "kyc", label: "KYC (Know Your Customer)" },
    { value: "loan", label: "Loan Application" },
    { value: "investment", label: "Investment Declaration" },
    { value: "account", label: "Account Opening" },
    { value: "other", label: "Other" },
  ];

  const addSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      name: "New Section",
      description: "Section description",
      fields: []
    };
    setFormConfig((prev) => ({
      ...prev,
      schema: [...prev.schema, newSection],
    }));
  };

  const updateSection = (sectionId, updates) => {
    setFormConfig((prev) => ({
      ...prev,
      schema: prev.schema.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    }));
  };

  const removeSection = (sectionId) => {
    if (formConfig.schema.length <= 1) {
      notifyError("You must have at least one section");
      return;
    }
    setFormConfig((prev) => ({
      ...prev,
      schema: prev.schema.filter((section) => section.id !== sectionId),
    }));
  };

  const addField = (type, sectionId = null) => {
    const targetSectionId = sectionId || formConfig.schema[0]?.id;
    
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      placeholder: type === "file" ? undefined : `Enter ${type} here...`,
      options: ["dropdown", "radio"].includes(type)
        ? ["Option 1", "Option 2"]
        : undefined,
    };
    
    setFormConfig((prev) => ({
      ...prev,
      schema: prev.schema.map((section) =>
        section.id === targetSectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ),
    }));
  };

  const updateField = (fieldId, updates) => {
    setFormConfig((prev) => ({
      ...prev,
      schema: prev.schema.map((section) => ({
        ...section,
        fields: section.fields.map((field) =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
      })),
    }));
  };

  const removeField = (fieldId) => {
    setFormConfig((prev) => ({
      ...prev,
      schema: prev.schema.map((section) => ({
        ...section,
        fields: section.fields.filter((field) => field.id !== fieldId),
      })),
    }));
  };

  const moveFieldToSection = (fieldId, targetSectionId) => {
    let fieldToMove = null;
    
    // Find and remove the field from its current section
    setFormConfig((prev) => {
      const updatedSections = prev.schema.map((section) => {
        const fieldIndex = section.fields.findIndex((field) => field.id === fieldId);
        if (fieldIndex !== -1) {
          fieldToMove = section.fields[fieldIndex];
          return {
            ...section,
            fields: section.fields.filter((field) => field.id !== fieldId),
          };
        }
        return section;
      });

      // Add the field to the target section
      return {
        ...prev,
        schema: updatedSections.map((section) =>
          section.id === targetSectionId && fieldToMove
            ? { ...section, fields: [...section.fields, fieldToMove] }
            : section
        ),
      };
    });
  };



  // Get current category label
  const getCurrentCategoryLabel = () => {
    const category = categoryOptions.find(cat => cat.value === formConfig.category);
    return category ? category.label : "Select a category";
  };

  const renderField = (field) => {
    const baseInputClass = "border border-gray-300 rounded-md p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";
    
    switch (field.type) {
      case "text":
        return <input className={baseInputClass} placeholder={field.placeholder} />;
      case "number":
        return <input type="number" className={baseInputClass} placeholder={field.placeholder} />;
      case "email":
        return <input type="email" className={baseInputClass} placeholder={field.placeholder} />;
      case "phone":
        return <input type="tel" className={baseInputClass} placeholder={field.placeholder} />;
      case "date":
        return <input type="date" className={baseInputClass} />;
      case "textarea":
        return <textarea className={`${baseInputClass} min-h-[100px] resize-y`} placeholder={field.placeholder}></textarea>;
      case "file":
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-gray-400 transition-colors">
            <input type="file" className="hidden" id={field.id} />
            <label htmlFor={field.id} className="cursor-pointer text-gray-600">
              📎 Click to upload or drag and drop
            </label>
          </div>
        );
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input type="checkbox" id={field.id} className="w-4 h-4 text-blue-600" />
            <label htmlFor={field.id} className="text-sm text-gray-700">
              {field.placeholder || "Check this option"}
            </label>
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <input type="radio" name={field.id} id={`${field.id}_${idx}`} className="w-4 h-4 text-blue-600" />
                <label htmlFor={`${field.id}_${idx}`} className="text-sm text-gray-700">{option}</label>
              </div>
            ))}
          </div>
        );
      case "dropdown":
        return (
          <Select.Root>
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
                {field.options?.map((option, idx) => (
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
        return <input className={baseInputClass} placeholder={field.placeholder} />;
    }
  };

  const saveForm = (e) => {
    e?.preventDefault(); 
     
    api.post("forms/", formConfig)
      .then((res) => {
       
        dispatch({ type: "SET_FORMS", payload: res.data });
        setFormConfig(res.data);
        setPreviewMode(false);
        notify("Form saved successfully");
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error saving form");
      });
  };

  const handleSaveAsDraft = () => {
    const draftFormConfig = {
      ...formConfig,
      is_active: false, 
    }
    api.post("forms/", draftFormConfig)
    .then((res) => {
   
      dispatch({ type: "SET_FORMS", payload: draftFormConfig });
      setFormConfig(res.data);
      setPreviewMode(false);
      notify("Form saved as draft successfully");
     
    })
    .catch((err) => {
      
      notifyError("Failed to save draft");
    });
   
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.post("forms/", formConfig)
      .then((res) => {
    
        dispatch({ type: "SET_FORMS", payload: res.data });
        setFormConfig(res.data);
        setPreviewMode(false);
        notify("Form saved successfully");
      })
      .catch((err) => {
        console.log(err);
        notifyError("Error saving form");
      });
      
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ToastContainer />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{formConfig.name || "Untitled Form"}</h1>
                {formConfig.description && (
                  <p className="text-gray-600 mt-1">{formConfig.description}</p>
                )}
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {getCurrentCategoryLabel()}
                  </span>
                </div>
              </div>
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setPreviewMode(false)}
              >
                Back to Editor
              </button>
            </div>
          </div>

          {/* Form Sections */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            {formConfig.schema.map((section, sectionIndex) => (
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
                  {section.fields.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <FaLayerGroup size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No fields in this section</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.fields.map((field) => {
                        // Full-width fields
                        const fullWidthFields = ['textarea', 'file'];
                        const isFullWidth = fullWidthFields.includes(field.type);
                        
                        return (
                          <div 
                            key={field.id} 
                            className={`space-y-2 ${isFullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}
                          >
                            <label className="block text-sm font-medium text-gray-700">
                              {field.label}
                              {field.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                            {renderField(field)}
                            {field.type === 'file' && (
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
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={handleSaveAsDraft}
                >
                  Save as Draft
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  Submit Form
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8">
      <ToastContainer />
      <div className="flex justify-between items-center mx-10">
        <div>
          <h2 className="font-semibold text-lg">Form Builder</h2>
          <p className="text-slate-500">Design and configure your onboarding forms</p>
        </div>
        <div className="space-x-2 flex flex-row">
          <button
            onClick={() => setPreviewMode(true)}
            className="px-3 py-1 border rounded flex items-center gap-1 cursor-pointer"
          >
            <FaEye size={14} /> Preview
          </button>
          <button
            onClick={saveForm}
            className="px-3 py-1 bg-blue-500 text-white rounded flex items-center gap-1 cursor-pointer"
          >
            <FaSave size={14} /> Save
          </button>
        </div>
      </div>

      {/* Field Types */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mx-10">
        
        <div className="border-slate-300 shadow-lg rounded-lg p-4 space-y-4 bg-white">
          <div>
            <h3 className="font-medium mb-2">Field Types</h3>
            {fieldTypes.map((f) => (
              <button
                key={f.value}
                onClick={() => addField(f.value)}
                className="w-full cursor-pointer rounded px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 mb-1"
              >
                {f.icon} {f.label}
              </button>
            ))}
          </div>
          
          <hr className="border-slate-200" />
          
          <div>
            <h3 className="font-medium mb-2">Sections</h3>
            <button
              onClick={addSection}
              className="w-full cursor-pointer rounded px-3 py-2 text-left flex items-center gap-2 hover:bg-slate-50 border border-dashed border-slate-300"
            >
              <FaLayerGroup size={14} /> Add Section
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 border rounded-lg p-4 space-y-6 bg-white border-slate-300 shadow-lg">
          <h3 className="font-medium text-base">Form Configuration</h3>

          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="form-name" className="text-sm font-medium">
                Form Name
              </label>
              <input
                id="form-name"
                value={formConfig.name}
                onChange={(e) =>
                  setFormConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., KYC Form, Loan Application"
                className="w-full border rounded p-2"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="form-category" className="text-sm font-medium">
                Category
              </label>
              <Select.Root
                value={formConfig.category}
                onValueChange={(value) =>
                  setFormConfig((prev) => ({ ...prev, category: value }))
                }
              >
                <Select.Trigger className="w-full border rounded p-2 flex justify-between items-center">
                  <Select.Value placeholder={getCurrentCategoryLabel()} />
                  <Select.Icon>
                    <FaChevronDown size={12} />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Content 
                  position="popper"
                  className="border bg-white rounded shadow-lg z-50 w-full min-w-[var(--radix-select-trigger-width)]"
                  sideOffset={5}
                >
                  <Select.Viewport>
                    {categoryOptions.map((category) => (
                      <Select.Item 
                        key={category.value} 
                        value={category.value}
                        className="p-2 hover:bg-slate-100 cursor-pointer flex items-center"
                      >
                        <Select.ItemText>{category.label}</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <FaCheck size={12} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Root>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="form-description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="form-description"
              value={formConfig.description}
              onChange={(e) =>
                setFormConfig((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Describe the purpose and requirements of this form"
              rows={3}
              className="w-full border rounded p-2"
            />
          </div>
          
          <hr className="border-t" />
          
          {/* Sections Config */}
          <div className="space-y-6">
            <h4 className="font-medium">Form Sections</h4>
            {formConfig && formConfig?.schema.map((section, sectionIndex) => (
              <div key={section.id} className="border-2 border-slate-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Section Name</label>
                      <input
                        value={section.name}
                        onChange={(e) => updateSection(section.id, { name: e.target.value })}
                        className="border p-2 w-full text-sm"
                        placeholder="Section name"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Description</label>
                      <input
                        value={section.description}
                        onChange={(e) => updateSection(section.id, { description: e.target.value })}
                        className="border p-2 w-full text-sm"
                        placeholder="Section description"
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-2 border rounded text-red-500 hover:bg-red-50"
                      disabled={formConfig.schema.length <= 1}
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>

                {/* Fields in this section */}
                <div className="space-y-3 ml-4 border-l-2 border-slate-100 pl-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-sm text-slate-700">Fields in this section</h5>
                    <div className="flex gap-2">
                      {fieldTypes.slice(0, 3).map((fieldType) => (
                        <button
                          key={fieldType.value}
                          onClick={() => addField(fieldType.value, section.id)}
                          className="text-xs px-2 py-1 border rounded hover:bg-slate-50 flex items-center gap-1"
                          title={`Add ${fieldType.label}`}
                        >
                          {fieldType.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {section.fields.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">
                      No fields in this section. Add fields using the buttons above or from the left panel.
                    </p>
                  ) : (
                    section.fields.map((field) => (
                      <div key={field.id} className="border rounded p-3 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-row gap-2 space-y-2 flex-1">
                            <div className="min-w-0 flex-1">
                              <label className="text-xs text-slate-600">Label</label>
                              <input
                                value={field.label}
                                onChange={(e) => updateField(field.id, { label: e.target.value })}
                                className="border p-1 w-full text-sm"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <label className="text-xs text-slate-600">Type</label>
                              <select
                                value={field.type}
                                onChange={(e) => updateField(field.id, { type: e.target.value })}
                                className="border p-1 w-full text-sm"
                              >
                                {fieldTypes.map((type) => (
                                  <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="min-w-0 flex-1">
                              <label className="text-xs text-slate-600">Placeholder</label>
                              <input
                                value={field.placeholder || ""}
                                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                className="border p-1 w-full text-sm"
                                placeholder="Placeholder"
                                disabled={field.type === "file"}
                              />
                            </div>
                            <div className="min-w-0">
                              <label className="text-xs text-slate-600">Move to</label>
                              <select
                                onChange={(e) => {
                                  if (e.target.value !== section.id) {
                                    moveFieldToSection(field.id, e.target.value);
                                  }
                                }}
                                value={section.id}
                                className="border p-1 w-full text-sm"
                              >
                                {formConfig.schema.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-slate-600">Required</label>
                              <Switch.Root
                                checked={field.required}
                                onCheckedChange={(checked) =>
                                  updateField(field.id, { required: checked })
                                }
                                className="w-8 h-4 bg-slate-300 rounded-full relative data-[state=checked]:bg-blue-500"
                              >
                                <Switch.Thumb className="block w-3 h-3 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-4" />
                              </Switch.Root>
                            </div>
                            <Dialog.Root>
                              <Dialog.Trigger asChild>
                                <button className="p-1 border rounded hover:bg-slate-100">
                                  <FaCog size={12} />
                                </button>
                              </Dialog.Trigger>
                              <Dialog.Content className="fixed inset-0 bg-white border rounded p-4 max-w-md mx-auto mt-20 shadow-lg z-50">
                                <Dialog.Title className="font-semibold mb-4">
                                  Field Settings
                                </Dialog.Title>
                                {(field.type === "dropdown" || field.type === "radio") && (
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Options (one per line)</label>
                                    <textarea
                                      value={field.options?.join("\n") || ""}
                                      onChange={(e) =>
                                        updateField(field.id, {
                                          options: e.target.value
                                            .split("\n")
                                            ,
                                        })
                                      }
                                      className="border p-2 w-full"
                                      rows={4}
                                      placeholder="One option per line"
                                    />
                                  </div>
                                )}
                                <div className="flex justify-end mt-4">
                                  <Dialog.Close asChild>
                                    <button className="px-3 py-1 bg-blue-600 text-white rounded">
                                      Save
                                    </button>
                                  </Dialog.Close>
                                </div>
                              </Dialog.Content>
                            </Dialog.Root>
                            <button
                              onClick={() => removeField(field.id)}
                              className="p-1 border rounded text-red-500 hover:bg-red-50"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}