import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { BottomNavigation } from '../components/BottomNavigation';
import { ApplyServiceModal } from './users/components/ApplyServiceModal';
import { useLanguageStore } from '../store/languageStore';
import { translations } from '../i18n/translations';
import { TeethDiagram } from './draft/components/TeethDiagram';
import { SelectedTeethBar } from './draft/components/SelectedTeethBar';
import { AppliedServicesList } from './draft/components/AppliedServicesList';
import { CreateRecordForm } from './draft/components/CreateRecordForm';

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
  const { language } = useLanguageStore();
  const t = translations[language].draft;
  const [selectedTeeth, setSelectedTeeth] = useState<SelectedTooth[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toothServices, setToothServices] = useState<ToothService[]>([]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);

  useEffect(() => {
    // Load tooth services from local storage on mount
    const savedServices = localStorage.getItem(STORAGE_KEY);
    if (savedServices) {
      const parsedServices = JSON.parse(savedServices);
      setToothServices(parsedServices);
      
      // Apply colors to teeth that have services
      applyTeethColors(parsedServices);
    }
  }, []);

  // Helper function to apply colors to teeth
  const applyTeethColors = (services: ToothService[]) => {
    // First reset all teeth colors
    const allTeethIds = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, '0'));
    allTeethIds.forEach(id => {
      const element = document.getElementById(`click${id}`);
      if (element) {
        const paths = Array.from(element.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        lastTwo.forEach(path => {
          path.style.fill = '#FAFAFA';
        });
      }
    });

    // Then apply colors for teeth with services
    services.forEach(item => {
      const element = document.getElementById(`click${item.toothId}`);
      if (element && item.services.length > 0) {
        const paths = Array.from(element.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        const color = item.services[0].categoryColor;
        lastTwo.forEach(path => {
          path.style.fill = color;
        });
      }
    });
  };

  const handleTeethClick = (event: React.MouseEvent<SVGElement>) => {
    // Find the closest parent element with an ID starting with 'click'
    const clickableParent = (event.target as Element).closest('[id^="click"]');
    
    if (clickableParent?.id) {
      const toothId = clickableParent.id.slice(-2); // Get last two characters
      
      // Check if tooth already has services applied
      const hasServices = toothServices.some(item => item.toothId === toothId);
      if (hasServices) {
        return; // Don't allow selection if services are already applied
      }
      
      // Check if tooth is already selected
      if (selectedTeeth.some(tooth => tooth.id === toothId)) {
        setSelectedTeeth(prev => prev.filter(tooth => tooth.id !== toothId));
        
        // Reset tooth color
        const paths = Array.from(clickableParent.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        lastTwo.forEach(path => {
          path.style.fill = '#FAFAFA';
        });
      } else {
        setSelectedTeeth(prev => [...prev, { id: toothId, name: `${t.tooth} ${toothId}` }]);
        
        // Highlight tooth
        const paths = Array.from(clickableParent.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        lastTwo.forEach(path => {
          path.style.fill = '#FFB3B3';
        });
      }
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleServiceApply = () => {
    if (selectedServices.length === 0) {
      setShowServiceModal(true);
      return;
    }

    // Create new tooth-service mappings
    const newMappings = selectedTeeth.map(tooth => ({
      toothId: tooth.id,
      services: selectedServices.map(service => ({
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
      if (element && selectedServices.length > 0) {
        const paths = Array.from(element.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        const color = selectedServices[0].categoryColor;
        lastTwo.forEach(path => {
          path.style.fill = color;
        });
      }
    });

    // Clear selected teeth and services
    setSelectedTeeth([]);
    setSelectedServices([]);
  };

  const handleClearAll = () => {
    // Clear all tooth colors
    const allTeethIds = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, '0'));
    allTeethIds.forEach(id => {
      const element = document.getElementById(`click${id}`);
      if (element) {
        const paths = Array.from(element.children).filter(child => 
          child.tagName.toLowerCase() === 'path'
        ) as SVGPathElement[];
        
        const lastTwo = paths.slice(-2);
        lastTwo.forEach(path => {
          path.style.fill = '#FAFAFA';
        });
      }
    });

    // Clear local storage and state
    localStorage.removeItem(STORAGE_KEY);
    setToothServices([]);
    setSelectedTeeth([]);
    setSelectedServices([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 mb-24">
        <div className="space-y-4">
          <TeethDiagram
            onTeethClick={handleTeethClick}
            onClearAll={handleClearAll}
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
          />

          <AppliedServicesList services={toothServices} />

          {toothServices.length > 0 && (
            <CreateRecordForm services={toothServices} onClearAll={handleClearAll} />
          )}
        </div>
      </div>

      <SelectedTeethBar
        selectedTeeth={selectedTeeth}
        onApplyServices={handleServiceApply}
        disabled={selectedTeeth.length === 0}
      />

      <BottomNavigation />

      <ApplyServiceModal
        showModal={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onApply={handleServiceApply}
        selectedServices={[]}
        modalTitle={`${selectedTeeth.length} ${t.applyToTeeth}`}
      />
    </div>
  );
};

export default Draft;