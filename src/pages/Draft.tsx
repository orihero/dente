import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { ApplyServiceModal } from './users/components/ApplyServiceModal';
import { ResponsiveTeethSvg } from '../components/ResponsiveTeethSvg';
import { Plus } from 'lucide-react';

interface SelectedTooth {
  id: string;
  name: string;
}

interface ToothService {
  toothId: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    warranty: string;
    categoryId: string;
    categoryColor: string;
  }>;
}

const STORAGE_KEY = 'tooth_services';

const Draft: React.FC = () => {
  const [selectedTeeth, setSelectedTeeth] = useState<SelectedTooth[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toothServices, setToothServices] = useState<ToothService[]>([]);

  // Load tooth services from local storage on mount
  useEffect(() => {
    const savedServices = localStorage.getItem(STORAGE_KEY);
    if (savedServices) {
      const parsedServices = JSON.parse(savedServices);
      setToothServices(parsedServices);
      
      // Apply colors to teeth that have services
      parsedServices.forEach((item: ToothService) => {
        const element = document.getElementById(`click${item.toothId}`);
        if (element) {
          const paths = Array.from(element.children).filter(child => 
            child.tagName.toLowerCase() === 'path'
          ) as SVGPathElement[];
          
          const lastTwo = paths.slice(-2);
          // Use the color of the first service in the list
          if (item.services.length > 0) {
            const color = item.services[0].categoryColor;
            lastTwo.forEach(path => {
              path.style.fill = color;
            });
          }
        }
      });
    }
  }, []);

  const handleTeethClick = (event: React.MouseEvent<SVGElement>) => {
    const element = event.target as SVGElement;
    const parentElement = element.parentElement;
    
    if (parentElement?.id && parentElement.id.startsWith('click')) {
      const toothId = parentElement.id.slice(-2); // Get last two characters
      
      // Check if tooth already has services applied
      const hasServices = toothServices.some(item => item.toothId === toothId);
      if (hasServices) {
        return; // Don't allow selection if services are already applied
      }
      
      // Check if tooth is already selected
      if (selectedTeeth.some(tooth => tooth.id === toothId)) {
        setSelectedTeeth(prev => prev.filter(tooth => tooth.id !== toothId));
        
        // Reset tooth color
        const paths = Array.from(parentElement.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        lastTwo.forEach(path => {
          path.style.fill = '#FAFAFA';
        });
      } else {
        setSelectedTeeth(prev => [...prev, { id: toothId, name: `Tooth ${toothId}` }]);
        
        // Highlight tooth
        const paths = Array.from(parentElement.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        lastTwo.forEach(path => {
          path.style.fill = '#FFB3B3';
        });
      }
    }
  };

  const handleServiceApply = (services: any[]) => {
    // Create new tooth-service mappings
    const newMappings = selectedTeeth.map(tooth => ({
      toothId: tooth.id,
      services: services.map(service => ({
        ...service,
        categoryId: service.categoryId,
        categoryColor: service.categoryColor
      }))
    }));

    // Update local storage
    const updatedServices = [...toothServices, ...newMappings];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));
    setToothServices(updatedServices);

    // Update tooth colors
    selectedTeeth.forEach(tooth => {
      const element = document.getElementById(`click${tooth.id}`);
      if (element && services.length > 0) {
        const paths = Array.from(element.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        const color = services[0].categoryColor;
        lastTwo.forEach(path => {
          path.style.fill = color;
        });
      }
    });

    // Clear selected teeth
    setSelectedTeeth([]);
    setShowServiceModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Selected Teeth Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Selected Teeth</h2>
            {selectedTeeth.length === 0 ? (
              <p className="text-gray-500">No teeth selected</p>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {selectedTeeth.map((tooth) => (
                    <div
                      key={tooth.id}
                      className="bg-gray-50 p-3 rounded-md flex items-center justify-between"
                    >
                      <span className="font-medium">Tooth {tooth.id}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowServiceModal(true)}
                  className="w-full mt-4 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Apply Services</span>
                </button>
              </div>
            )}
          </div>

          {/* Teeth SVG Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <ResponsiveTeethSvg onClick={handleTeethClick} />
          </div>
        </div>

        {/* Applied Services */}
        {toothServices.length > 0 && (
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Applied Services</h2>
            <div className="space-y-4">
              {toothServices.map((item) => (
                <div key={item.toothId} className="border-b pb-4">
                  <h3 className="font-medium mb-2">Tooth {item.toothId}</h3>
                  <div className="grid gap-2">
                    {item.services.map((service, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-md"
                        style={{ backgroundColor: `${service.categoryColor}20` }}
                      >
                        <div className="flex justify-between">
                          <span>{service.name}</span>
                          <span className="font-medium">{service.price.toLocaleString()} UZS</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Duration: {service.duration} • Warranty: {service.warranty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />

      {showServiceModal && (
        <ApplyServiceModal
          showModal={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onApply={handleServiceApply}
          selectedServices={[]}
          modalTitle={`Apply services to ${selectedTeeth.length} teeth`}
        />
      )}
    </div>
  );
};

export default Draft;