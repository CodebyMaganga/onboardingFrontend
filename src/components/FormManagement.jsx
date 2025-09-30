import React, {  useState,useEffect} from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { 
  FiSearch, 
  FiFilter, 
  FiEye, 
  FiEdit, 
  FiCopy, 
  FiArchive, 
  FiTrash2, 
  FiFileText, 
  FiUsers, 
  FiClock, 
  FiCheckCircle, 
  FiBarChart2,
  FiMoreHorizontal 
} from 'react-icons/fi';
import { useFormStore } from "../store/context";
import api from '../api';
import EditForm from './EditForm';



export default function FormManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);

  const { state, dispatch } = useFormStore();



  const filteredForms = state.forms.filter(form => {
    const matchesSearch = form.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || form.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryLabel = (category) => {
    const labels = {
      kyc: 'KYC',
      loan: 'Loan',
      investment: 'Investment',
      account: 'Account'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status) => {
    status = status === true ? 'active' : status === false ? 'inactive' : '';

    
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '': 'bg-slate-100 text-slate-600 border-slate-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };



  

  const deleteForm = (formId) => {
    // Confirm deletion first
    if (!window.confirm("Are you sure you want to delete this form?")) {
      return;
    }
  
    api.delete(`forms/${formId}/`)
      .then((res) => {
        // Filter from state.forms, not filteredForms
        const updatedForms = state.forms.filter(form => form.id !== formId);
        dispatch({ type: "SET_FORMS", payload: updatedForms });
        console.log("Form deleted:", res);
        alert("Form deleted successfully!");
      })
      .catch((err) => {
        console.error("Error deleting form:", err);
        alert("Failed to delete form. Please try again.");
      });
  };

  useEffect(() => {
    console.log(state.forms);
  }, [state.forms]);

  
  // Custom Select Component
  const CustomSelect = ({ value, onValueChange, items, placeholder }) => (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="flex items-center justify-between w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        <Select.Value placeholder={placeholder} />
        <Select.Icon className="text-slate-400">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M4 6H11L7.5 10.5L4 6Z" fill="currentColor"/>
          </svg>
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-white border border-slate-200 rounded-md shadow-lg z-50">
          <Select.ScrollUpButton />
          <Select.Viewport className="p-1">
            {items.map((item) => (
              <Select.Item 
                key={item.value} 
                value={item.value}
                className="relative flex items-center px-3 py-2 text-sm rounded-md cursor-pointer select-none data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[highlighted]:outline-none"
              >
                <Select.ItemText>{item.label}</Select.ItemText>
                <Select.ItemIndicator className="absolute left-1">
                  <FiCheckCircle className="w-4 h-4" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );

  const handleEditForm = (formId) => {
    setSelectedFormId(formId);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedFormId(null);
  };

  return (

    <div className="space-y-6 p-6 mx-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Form Management</h3>
          <p className="text-slate-600">Manage all your onboarding forms</p>
        </div>
      </div>

      

      {/* Forms Table */}
      {editMode && selectedFormId ? 
        <EditForm formId={selectedFormId} onCancel={handleCancelEdit} />
      :
      <>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <CustomSelect
                value={filterCategory}
                onValueChange={setFilterCategory}
                placeholder="Category"
                items={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'kyc', label: 'KYC' },
                  { value: 'loan', label: 'Loan' },
                  { value: 'investment', label: 'Investment' },
                  { value: 'account', label: 'Account' }
                ]}
              />
              <CustomSelect
                value={filterStatus}
                onValueChange={setFilterStatus}
                placeholder="Status"
                items={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'archived', label: 'Archived' }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">All Forms</h4>
              <p className="text-slate-600">{filteredForms.length} forms found</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Form Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Fields</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Version</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Completion Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Last Modified</th>
                  <th className="text-left py-3 px-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.map((form) => (
                  <tr key={form.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <FiFileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{form.name}</div>
                          <div className="text-sm text-slate-500">Created {form.createdAt}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-300 text-slate-700">
                        {getCategoryLabel(form.category)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(form.is_active)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                      <span className="text-slate-900">
  {form && Array.isArray(form.schema) 
    ? form.schema.reduce((total, section) => total + (section.fields?.length || 0), 0) 
    : 0}
</span>
                        <span className="text-slate-400">fields</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        
                        <span className="text-slate-900">{form.version}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${form.completionRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-900">{form.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1 text-sm text-slate-500">
                        <FiClock className="h-3 w-3" />
                        <span>{form.lastModified}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="inline-flex items-center justify-center p-1 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <FiMoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content 
                            className="bg-white border border-slate-200 rounded-md shadow-lg p-1 min-w-[150px] z-50"
                            sideOffset={5}
                          >
                           
                            <DropdownMenu.Item onClick={() => handleEditForm(form.id)} className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 focus:outline-none focus:bg-slate-100">
                              <FiEdit className="h-4 w-4 mr-2" />
                              Edit Form
                            </DropdownMenu.Item>
                           
                            
                            <DropdownMenu.Item 
                              className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                              onClick={() => deleteForm(form.id)}
                            >
                              <FiTrash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Active Forms</p>
            <p className="text-2xl font-bold text-slate-900">
              {state.forms.filter(f => f.is_active === true).length}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-lg">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Total Submissions</p>
            <p className="text-2xl font-bold text-slate-900">
              {state.submissions.reduce((sum, f) => sum + f.submissions, 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <FiUsers className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Avg. Completion Rate</p>
            <p className="text-2xl font-bold text-slate-900">
              {Math.round(state.forms.reduce((sum, f) => sum + f.completionRate, 0) / state.forms.length)}%
            </p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <FiBarChart2 className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
    </>
      }

     
      
    </div>
  );
}