import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const t = translations[language].draft;
  const [selectedTeeth, setSelectedTeeth] = useState<SelectedTooth[]>([]);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toothServices, setToothServices] = useState<ToothService[]>([]);
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    // Load tooth services from local storage on mount
    const savedServices = localStorage.getItem(STORAGE_KEY);
    if (savedServices) {
      const parsedServices = JSON.parse(savedServices);
      setToothServices(parsedServices);
      
      // Calculate initial total price
      const total = parsedServices.reduce((sum: number, item: ToothService) => {
        return sum + item.services.reduce((serviceSum: number, service) => {
          return serviceSum + service.price;
        }, 0);
      }, 0);
      setTotalPrice(total);
      
      // Apply colors to teeth that have services
      applyTeethColors(parsedServices);
    }
  }, []);

  // Helper function to apply colors to teeth
  const applyTeethColors = (services: ToothService[]) => {
    // First reset all teeth colors
    const allTeethIds = Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, '0'));
    allTeethIds.forEach(id => {
      resetToothColor(id);
    });

    // Then apply colors for teeth with services
    services.forEach(item => {
      const element = document.getElementById(`click${item.toothId}`);
      if (element && item.services.length > 0) {
        Array.from(element.children).forEach(child => {
          if (child.tagName.toLowerCase() === 'path') {
            const path = child as SVGPathElement;
            // Skip paths that match the exclusion criteria (fill="black" and fill-opacity="0.71")
            const fill = path.getAttribute('fill');
            const fillOpacity = path.getAttribute('fill-opacity');
            if (!(fill === 'black' && fillOpacity === '0.71')) {
              path.style.fill = item.services[0].categoryColor;
            }
          }
        });
      }
    });
  };

  const resetToothColor = (toothId: string) => {
    const element = document.getElementById(`click${toothId}`);
    if (element) {
      Array.from(element.children).forEach(child => {
        if (child.tagName.toLowerCase() === 'path') {
          const path = child as SVGPathElement;
          // Skip paths that match the exclusion criteria (fill="black" and fill-opacity="0.71")
          const fill = path.getAttribute('fill');
          const fillOpacity = path.getAttribute('fill-opacity');
          if (!(fill === 'black' && fillOpacity === '0.71')) {
            path.style.fill = '#FAFAFA';
          }
        }
      });
    }
  };

  const handleTeethClick = (event: React.MouseEvent<SVGElement>) => {
    // Find the closest parent element with an ID starting with 'click'
    const clickableParent = (event.target as Element).closest('[id^="click"]');
    if (!clickableParent) return; // Exit if no valid parent is found

    const toothId = clickableParent.id.slice(-2); // Extract last two characters of the ID

    // Check if the tooth already has services applied
    const hasServices = toothServices.some(item => item.toothId === toothId);
    if (hasServices) return; // Prevent selection if services are applied

    // Determine if the tooth is already selected
    const isSelected = selectedTeeth.some(tooth => tooth.id === toothId);

    if (isSelected) {
        // Deselect the tooth
        setSelectedTeeth(prev => prev.filter(tooth => tooth.id !== toothId));

        // Reset the tooth color
        Array.from(clickableParent.children).forEach(child => {
            if (child.tagName.toLowerCase() === 'path') {
                const path = child as SVGPathElement;
                // Skip paths that match the exclusion criteria (fill="black" and fill-opacity="0.71")
                const fill = path.getAttribute('fill');
                const fillOpacity = path.getAttribute('fill-opacity');
                if (!(fill === 'black' && fillOpacity === '0.71') && path.id !== toothId) {
                    path.style.fill = '#FAFAFA'; // Reset to default color
                }
            }
        });
    } else {
        // Select the tooth
        setSelectedTeeth(prev => [...prev, { id: toothId, name: `Tooth ${toothId}` }]);

        // Highlight the tooth
        Array.from(clickableParent.children).forEach(child => {
            if (child.tagName.toLowerCase() === 'path') {
                const path = child as SVGPathElement;
                // Skip paths that match the exclusion criteria (fill="black" and fill-opacity="0.71")
                const fill = path.getAttribute('fill');
                const fillOpacity = path.getAttribute('fill-opacity');
                if (!(fill === 'black' && fillOpacity === '0.71') && path.id !== toothId) {
                    path.style.fill = '#FFB3B3'; // Highlight color
                }
            }
        });
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

  const handleServiceApply = (services: any[]) => {
    if (!services || services.length === 0) {
      setShowServiceModal(true);
      return;
    }

    // Create new tooth-service mappings
    const newMappings = selectedTeeth.map(tooth => ({
      toothId: tooth.id,
      services: services.map(service => ({
        id: service.id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        warranty: service.warranty,
        categoryId: service.categoryId,
        categoryColor: service.categoryColor
      }))
    }));

    // Update local storage
    const updatedServices = [...toothServices, ...newMappings];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedServices));
    setToothServices(updatedServices);

    // Calculate new total price
    const newTotal = updatedServices.reduce((sum, item) => {
      return sum + item.services.reduce((serviceSum, service) => {
        return serviceSum + service.price;
      }, 0);
    }, 0);
    setTotalPrice(newTotal);

    // Update tooth colors
    selectedTeeth.forEach(tooth => {
      const element = document.getElementById(`click${tooth.id}`);
      if (element && services.length > 0) {
        Array.from(element.children).forEach(child => {
          if (child.tagName.toLowerCase() === 'path') {
            const path = child as SVGPathElement;
            // Skip paths that match the exclusion criteria (fill="black" and fill-opacity="0.71")
            const fill = path.getAttribute('fill');
            const fillOpacity = path.getAttribute('fill-opacity');
            if (!(fill === 'black' && fillOpacity === '0.71')) {
              path.style.fill = services[0].categoryColor;
            }
          }
        });
      }
    });

    // Clear selected teeth and services
    setSelectedTeeth([]);
    setSelectedServices([]);
    setShowServiceModal(false);
  };

  const handleClearAll = () => {
    // Clear all tooth colors in both adult and milk teeth diagrams
    const resetAllTeeth = (prefix: string) => {
      // Reset adult teeth (1-32)
      Array.from({ length: 32 }, (_, i) => String(i + 1).padStart(2, '0')).forEach(id => {
        const element = document.getElementById(`${prefix}${id}`);
        if (element) {
          Array.from(element.children).forEach(child => {
            if (child.tagName.toLowerCase() === 'path') {
              const path = child as SVGPathElement;
              // Skip paths that match the exclusion criteria (fill="black" and fill-opacity="0.71")
              const fill = path.getAttribute('fill');
              const fillOpacity = path.getAttribute('fill-opacity');
              if (!(fill === 'black' && fillOpacity === '0.71')) {
                path.style.fill = '#FAFAFA';
              }
            }
          });
        }
      });
    };

    // Reset both adult and milk teeth diagrams
    resetAllTeeth('click');
    resetAllTeeth('milk');

    // Clear local storage and state
    localStorage.removeItem(STORAGE_KEY);
    setToothServices([]);
    setSelectedTeeth([]);
    setSelectedServices([]);
    setTotalPrice(0);
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

          {/* Always show CreateRecordForm if patient data exists */}
          {(toothServices.length > 0 || location.state?.patient) && (
            <>
              {toothServices.length > 0 && (
                <AppliedServicesList services={toothServices} />
              )}
              <CreateRecordForm 
                services={toothServices} 
                onClearAll={handleClearAll}
                totalPrice={totalPrice}
              />
            </>
          )}
        </div>
      </div>

      <SelectedTeethBar
        selectedTeeth={selectedTeeth}
        onApplyServices={() => setShowServiceModal(true)}
        disabled={selectedTeeth.length === 0}
      />

      <BottomNavigation />

      <ApplyServiceModal
        showModal={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onApply={handleServiceApply}
        selectedServices={selectedServices}
        modalTitle={`${selectedTeeth.length} ${t.applyToTeeth}`}
      />
    </div>
  );
};

export default Draft;