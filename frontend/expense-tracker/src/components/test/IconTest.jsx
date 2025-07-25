// Quick icon test component to verify all imports work
import React from 'react';
import { LuMail, LuSettings, LuCheckCircle, LuInfo, LuRefreshCw } from 'react-icons/lu';
import { FaRobot, FaExclamationTriangle } from 'react-icons/fa';

const IconTest = () => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Icon Test - All Should Display:</h3>
      <div className="flex gap-4 flex-wrap">
        <div className="flex flex-col items-center gap-2">
          <LuMail className="text-2xl text-blue-500" />
          <span className="text-xs">LuMail</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <LuSettings className="text-2xl text-gray-500" />
          <span className="text-xs">LuSettings</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <LuCheckCircle className="text-2xl text-green-500" />
          <span className="text-xs">LuCheckCircle</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <LuInfo className="text-2xl text-purple-500" />
          <span className="text-xs">LuInfo</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <LuRefreshCw className="text-2xl text-indigo-500" />
          <span className="text-xs">LuRefreshCw</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FaRobot className="text-2xl text-purple-600" />
          <span className="text-xs">FaRobot</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <FaExclamationTriangle className="text-2xl text-orange-500" />
          <span className="text-xs">FaExclamationTriangle</span>
        </div>
      </div>
    </div>
  );
};

export default IconTest;
