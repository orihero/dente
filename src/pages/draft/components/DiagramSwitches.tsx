import React from 'react';
import { Bluetooth as Tooth, List, Sidebar as LayoutSidebarRight } from 'lucide-react';
import { useLanguageStore } from '../../../store/languageStore';
import { Switch } from '../../../components/Switch';

interface DiagramSwitchesProps {
  isMilkTeeth: boolean;
  setIsMilkTeeth: (value: boolean) => void;
  showServices: boolean;
  setShowServices: (value: boolean) => void;
  diagramRight: boolean;
  setDiagramRight: (value: boolean) => void;
}

export const DiagramSwitches: React.FC<DiagramSwitchesProps> = ({
  isMilkTeeth,
  setIsMilkTeeth,
  showServices,
  setShowServices,
  diagramRight,
  setDiagramRight
}) => {
  const { language } = useLanguageStore();

  // Add handlers that stop event propagation
  const handleMilkTeethChange = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Stop event from reaching the diagram
    setIsMilkTeeth(!isMilkTeeth);
  };

  const handleServicesChange = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Stop event from reaching the diagram
    setShowServices(!showServices);
  };

  const handleDiagramRightChange = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation(); // Stop event from reaching the diagram
    setDiagramRight(!diagramRight);
  };

  return (
    <div className="flex items-center gap-6">
      {/* Teeth Type Switch */}
      <div 
        className="flex items-center gap-2" 
        onClick={handleMilkTeethChange}
      >
        <Tooth className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-700">
          {language === 'uz' ? 'Sut tishlari' : 'Молочные зубы'}
        </span>
        <Switch
          checked={isMilkTeeth}
          onChange={() => {}} // Handle change in parent onClick instead
        />
      </div>

      {/* Services/Module Switch */}
      <div 
        className="flex items-center gap-2"
        onClick={handleServicesChange}
      >
        <List className="w-5 h-5 text-gray-500" />
        <span className="text-sm text-gray-700">
          {language === 'uz' ? 'Xizmatlar' : 'Услуги'}
        </span>
        <Switch
          checked={showServices}
          onChange={() => {}} // Handle change in parent onClick instead
        />
      </div>

      {/* Only show Diagram Right switch when services are enabled */}
      {showServices && (
        <div 
          className="flex items-center gap-2"
          onClick={handleDiagramRightChange}
        >
          <LayoutSidebarRight className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">
            {language === 'uz' ? 'O\'ng diagramma' : 'Правая диаграмма'}
          </span>
          <Switch
            checked={diagramRight}
            onChange={() => {}} // Handle change in parent onClick instead
          />
        </div>
      )}
    </div>
  );
};