import { useFormStore } from "../store/context";
import { useEffect, useState } from "react";
import * as Select from "@radix-ui/react-select";
import { FaChevronDown, FaCheck, FaLayerGroup, FaSave, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import api from "../api";
import {toast, ToastContainer} from 'react-toastify';

const EditForm = ({ formId, onCancel }) => {
  const { state } = useFormStore();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [builderMode, setBuilderMode] = useState(false);

  useEffect(() => {
    const foundForm = state.forms.find((f) => f.id === formId);

    if (foundForm) {
      setForm(foundForm);
      const initialData = {};

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
      setLoading(false);
    }
  }, [state.forms, formId]);

  // ========= FORM BUILDER HELPERS =========
  const addSection = () => {
    const newSection = {
      id: `section_${Date.now()}`,
      name: "New Section",
      description: "",
      fields: [],
    };
    setForm((prev) => ({
      ...prev,
      schema: [...(prev.schema || []), newSection],
    }));
  };

  const removeSection = (sectionIndex) => {
    setForm((prev) => {
      const updated = { ...prev };
      updated.schema.splice(sectionIndex, 1);
      return { ...updated };
    });
  };

  const addField = (sectionIndex) => {
    const newField = {
      id: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      placeholder: "",
      required: false,
      options: [],
    };
    setForm((prev) => {
      const updated = { ...prev };
      updated.schema[sectionIndex].fields.push(newField);
      return { ...updated };
    });
  };

  const updateField = (sectionIndex, fieldIndex, key, value) => {
    setForm((prev) => {
      const updated = { ...prev };
      updated.schema[sectionIndex].fields[fieldIndex][key] = value;
      return { ...updated };
    });
  };

  const removeField = (sectionIndex, fieldIndex) => {
    setForm((prev) => {
      const updated = { ...prev };
      updated.schema[sectionIndex].fields.splice(fieldIndex, 1);
      return { ...updated };
    });
  };

  const handleSaveForm = () => {
    api
      .put(`forms/${form.id}/`, form)
      .then((res) => {
        notify("Form updated successfully");
      })
      .catch((err) => {
        console.error(err);
        notifyError("Failed to update form.");
      });
  };

  // ========= FORM FILLING HELPERS =========
  const handleFieldChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
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
      notifyError("Please fill in all required fields");
      return;
    }

    const submissionData = {
      formId: form.id,
      formName: form.name,
      category: form.category,
      responses: formData,
      submittedAt: new Date().toISOString(),
    };

    api
      .post("http://127.0.0.1:8000/api/form-submissions/", submissionData)
      .then(() => {
        notify("Form submitted successfully!");
      })
      .catch(() => {
        notifyError("Failed to submit form. Please try again.");
      });
  };

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

  // ========= RENDER HELPERS =========
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
      case "dropdown":
        return (
          <Select.Root value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
            <Select.Trigger className={`${baseInputClass} flex justify-between items-center`}>
              <Select.Value placeholder="Select option" />
              <Select.Icon>
                <FaChevronDown size={12} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Content className="border bg-white rounded-md shadow-lg z-50 w-full">
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

  const renderFieldEditor = (field, sectionIndex, fieldIndex) => (
    <div className="p-4 border rounded-md bg-gray-50 space-y-2">
      <input
        type="text"
        className="border p-2 w-full rounded"
        value={field.label}
        onChange={(e) => updateField(sectionIndex, fieldIndex, "label", e.target.value)}
        placeholder="Field Label"
      />
      <select
        className="border p-2 w-full rounded"
        value={field.type}
        onChange={(e) => updateField(sectionIndex, fieldIndex, "type", e.target.value)}
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="email">Email</option>
        <option value="date">Date</option>
        <option value="textarea">Textarea</option>
        <option value="dropdown">Dropdown</option>
        <option value="radio">Radio</option>
        <option value="checkbox">Checkbox</option>
        <option value="file">File</option>
      </select>
      {["dropdown", "radio"].includes(field.type) && (
        <textarea
          className="border p-2 w-full rounded"
          value={field.options?.join("\n") || ""}
          onChange={(e) => updateField(sectionIndex, fieldIndex, "options", e.target.value.split("\n"))}
          placeholder="Enter options, one per line"
        />
      )}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => updateField(sectionIndex, fieldIndex, "required", e.target.checked)}
        />
        <span>Required</span>
      </label>
      <button
        onClick={() => removeField(sectionIndex, fieldIndex)}
        className="text-red-500 text-sm flex items-center gap-1"
      >
        <FaTrash /> Delete Field
      </button>
    </div>
  );

  if (loading || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{form.name || "Untitled Form"}</h1>
            <p className="text-gray-600">{form.description}</p>
          </div>
          <button
            onClick={() => setBuilderMode((prev) => !prev)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-md flex items-center gap-2 cursor-pointer"
          >
            <FaEdit />
            {builderMode ? "Switch to Preview" : "Switch to Builder"}
          </button>
        </div>

        {builderMode ? (
          <div className="space-y-6">
            {form.schema?.map((section, sectionIndex) => (
              <div key={section.id} className="bg-white p-4 border rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <input
                    className="text-lg font-semibold border-b flex-1"
                    value={section.name}
                    onChange={(e) => {
                      setForm((prev) => {
                        const updated = { ...prev };
                        updated.schema[sectionIndex].name = e.target.value;
                        return { ...updated };
                      });
                    }}
                  />
                  <button
                    onClick={() => removeSection(sectionIndex)}
                    className="text-red-500 flex items-center gap-1 ml-2"
                  >
                    <FaTrash /> Delete Section
                  </button>
                </div>
                <div className="space-y-4">
                  {section.fields?.map((field, fieldIndex) =>
                    renderFieldEditor(field, sectionIndex, fieldIndex)
                  )}
                </div>
                <button
                  onClick={() => addField(sectionIndex)}
                  className="mt-4 px-3 py-1 border rounded flex items-center gap-1"
                >
                  <FaPlus /> Add Field
                </button>
              </div>
            ))}
            <button
              onClick={addSection}
              className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
            >
              <FaPlus /> Add Section
            </button>
            <button
              onClick={handleSaveForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
            >
              <FaSave /> Save Form
            </button>
          </div>
        ) : (
          <form className="space-y-8" onSubmit={handleSubmit}>
            {form.schema?.map((section, idx) => (
              <div key={section.id} className="bg-white rounded-md border p-6">
                <h2 className="font-semibold text-lg mb-4">{section.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {section.fields?.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {renderField(field)}
                      {errors[field.id] && (
                        <p className="text-xs text-red-500">{errors[field.id]}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
              >
                <FaSave /> Submit Form
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditForm;
