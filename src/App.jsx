import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DisclaimerBanner from './components/layout/DisclaimerBanner';

// Workflow Order Pages
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import Engineering from './pages/Engineering';
import Operations from './pages/Operations';
import MLPredictionOverview from './pages/MLPredictionOverview';
import AIBlockPlanner from './pages/AIBlockPlanner';
import BlockSchedule from './pages/BlockSchedule';
import LearningLoop from './pages/LearningLoop';
import DigitalTwinSimulation from './pages/DigitalTwinSimulation';

// Auxiliary Pages
import Assets from './pages/Assets';
import MaintenanceRequests from './pages/MaintenanceRequests';
import ApprovalWorkflow from './pages/ApprovalWorkflow';
import ExecutionMonitor from './pages/ExecutionMonitor';
import DepartmentDashboard from './pages/DepartmentDashboard';
import DepartmentRecordDetails from './pages/DepartmentRecordDetails';
import StationNetwork from './pages/StationNetwork';
import StationSatelliteView from './pages/StationSatelliteView';
import ZonesDivisions from './pages/ZonesDivisions';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import BackendSystemMonitor from './pages/BackendSystemMonitor';

import ZoneDirectoryView from './components/network/ZoneDirectoryView';
import ZoneDetailsView from './components/network/ZoneDetailsView';
import DivisionDirectoryView from './components/network/DivisionDirectoryView';
import DivisionDetailsView from './components/network/DivisionDetailsView';
import StationDirectoryView from './components/network/StationDirectoryView';
import StationDetailsView from './components/network/StationDetailsView';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RailwayNetworkProvider } from './context/RailwayNetworkContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

function AppContent() {
  const { isAuthenticated, loading, getDefaultRoute } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#071426] flex items-center justify-center text-white font-mono text-xs">
        Loading System Security Session...
      </div>
    );
  }

  // 1. Unauthenticated -> Show Login Screen or Direct Approval Action Routes
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/approve" element={<ApprovalWorkflow />} />
        <Route path="/approve/:token" element={<ApprovalWorkflow />} />
        <Route path="/approval" element={<ApprovalWorkflow />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 2. Authenticated -> Render Application Shell & Protected Routes
  return (
    <div className="h-screen w-screen overflow-hidden relative vision-room-bg">
      {/* Full Viewport Application Shell */}
      <div className="w-full h-full vision-outer-shell overflow-hidden flex flex-row relative z-10 border-0 rounded-none">
        {/* Main Integrated Sidebar */}
        <Sidebar />

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <DisclaimerBanner />
          <Header />

          <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <Routes>
              <Route path="/login" element={<Navigate to={getDefaultRoute()} replace />} />

              {/* 9-STAGE MAIN SYSTEM WORKFLOW ROUTES */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/requests" element={<ProtectedRoute><MaintenanceRequests initialTab="requests" /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><MaintenanceRequests initialTab="maintenance" /></ProtectedRoute>} />
              <Route path="/engineering" element={<ProtectedRoute><MaintenanceRequests initialTab="engineering" /></ProtectedRoute>} />
              <Route path="/operations" element={<ProtectedRoute><MaintenanceRequests initialTab="operations" /></ProtectedRoute>} />
              <Route path="/ml-predictions" element={<ProtectedRoute><MLPredictionOverview /></ProtectedRoute>} />
              <Route path="/ml" element={<ProtectedRoute><MLPredictionOverview /></ProtectedRoute>} />
              <Route path="/ai-planner" element={<ProtectedRoute><AIBlockPlanner /></ProtectedRoute>} />
              <Route path="/block-planner" element={<ProtectedRoute><AIBlockPlanner /></ProtectedRoute>} />
              <Route path="/schedule" element={<ProtectedRoute><BlockSchedule /></ProtectedRoute>} />
              <Route path="/block-schedule" element={<ProtectedRoute><BlockSchedule /></ProtectedRoute>} />
              <Route path="/digital-twin" element={<ProtectedRoute><DigitalTwinSimulation /></ProtectedRoute>} />
              <Route path="/approval" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
              <Route path="/approvals" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
              <Route path="/approve" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
              <Route path="/approve/:token" element={<ProtectedRoute><ApprovalWorkflow /></ProtectedRoute>} />
              <Route path="/execution" element={<ProtectedRoute><ExecutionMonitor /></ProtectedRoute>} />

              <Route path="/execution-monitor" element={<ProtectedRoute><ExecutionMonitor /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/learning" element={<ProtectedRoute><LearningLoop /></ProtectedRoute>} />

              {/* DEDICATED RAILWAY NETWORK ROUTES */}
              <Route path="/railway-network/zones" element={<ProtectedRoute><ZoneDirectoryView /></ProtectedRoute>} />
              <Route path="/railway-network/zones/:zoneId" element={<ProtectedRoute><ZoneDetailsView /></ProtectedRoute>} />
              <Route path="/railway-network/divisions" element={<ProtectedRoute><DivisionDirectoryView /></ProtectedRoute>} />
              <Route path="/railway-network/divisions/:divisionId" element={<ProtectedRoute><DivisionDetailsView /></ProtectedRoute>} />
              <Route path="/railway-network/stations" element={<ProtectedRoute><ErrorBoundary pageTitle="Station Directory"><StationDirectoryView /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/railway-network/stations/:stationId" element={<ProtectedRoute><ErrorBoundary pageTitle="Station Details"><StationDetailsView /></ErrorBoundary></ProtectedRoute>} />

              {/* DEDICATED DEPARTMENT DATASET ROUTES */}
              <Route path="/departments/:deptId" element={<ProtectedRoute><ErrorBoundary pageTitle="Department Dashboard"><DepartmentDashboard /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/departments/:deptId/:recordId" element={<ProtectedRoute><ErrorBoundary pageTitle="Department Record Details"><DepartmentRecordDetails /></ErrorBoundary></ProtectedRoute>} />

              {/* MANAGEMENT & AUXILIARY ROUTES */}
              <Route path="/system-monitor" element={<ProtectedRoute><BackendSystemMonitor /></ProtectedRoute>} />
              <Route path="/assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
              <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
              <Route path="/department/:deptId" element={<ProtectedRoute><ErrorBoundary pageTitle="Department Dashboard"><DepartmentDashboard /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/network" element={<ProtectedRoute><ErrorBoundary pageTitle="Station Network"><StationNetwork /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/stations" element={<ProtectedRoute><ErrorBoundary pageTitle="Station Satellite View"><StationSatelliteView /></ErrorBoundary></ProtectedRoute>} />
              <Route path="/zones" element={<ProtectedRoute><ZonesDivisions /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />

            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RailwayNetworkProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </RailwayNetworkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
