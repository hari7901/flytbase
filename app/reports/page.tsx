"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart3, Download, Calendar, Clock, MapPin, DrillIcon as Drone } from "lucide-react"
import Link from "next/link"
import { useSurveys, useFlightStats, useDrones, useMissions } from "@/hooks/use-firebase-data"

// Mock data for charts
const surveyTypeData = [
  { name: "Facility Inspection", value: 35, color: "#3b82f6" },
  { name: "Site Mapping", value: 25, color: "#10b981" },
  { name: "Security Patrol", value: 20, color: "#f59e0b" },
  { name: "Environmental Monitoring", value: 20, color: "#ef4444" },
]

const droneUtilizationData = [
  { drone: "Surveyor Alpha", missions: 28, hours: 75, efficiency: 92 },
  { drone: "Mapper Beta", missions: 32, hours: 88, efficiency: 89 },
  { drone: "Inspector Gamma", missions: 25, hours: 67, efficiency: 85 },
  { drone: "Scout Delta", missions: 22, hours: 58, efficiency: 88 },
  { drone: "Guardian Echo", missions: 30, hours: 82, efficiency: 91 },
]

export default function SurveyReports() {
  const { surveys, loading: surveysLoading } = useSurveys()
  const { flightStats, loading: statsLoading } = useFlightStats()
  const { drones } = useDrones()
  const { missions } = useMissions()
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months")
  const [selectedDrone, setSelectedDrone] = useState("all")

  // Calculate organization stats from real data
  const organizationStats = {
    totalSurveys: surveys.length,
    totalFlightHours: Math.round(drones.reduce((acc, d) => acc + d.totalFlightTime, 0)),
    totalDistance: Math.round(flightStats.reduce((acc, stat) => acc + stat.distance, 0)),
    averageEfficiency: 89,
    dataPointsCollected: surveys.reduce((acc, survey) => acc + survey.dataPoints, 0),
    imagesCaptures: surveys.reduce((acc, survey) => acc + survey.images, 0),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "processing":
        return "bg-blue-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleExportReport = () => {
    alert("Report export functionality would be implemented here")
  }

  if (surveysLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Survey Reports & Analytics</h1>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/fleet" className="text-gray-600 hover:text-gray-900">
                Fleet
              </Link>
              <Link href="/missions" className="text-gray-600 hover:text-gray-900">
                Missions
              </Link>
              <Link href="/planning" className="text-gray-600 hover:text-gray-900">
                Planning
              </Link>
              <Link href="/monitoring" className="text-gray-600 hover:text-gray-900">
                Live Monitor
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Export */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-4">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDrone} onValueChange={setSelectedDrone}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Drones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drones</SelectItem>
                {drones.map((drone) => (
                  <SelectItem key={drone.id} value={drone.id}>
                    {drone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Organization Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizationStats.totalSurveys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Flight Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizationStats.totalFlightHours}h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizationStats.totalDistance}km</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizationStats.averageEfficiency}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizationStats.dataPointsCollected.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organizationStats.imagesCaptures.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="surveys">Survey History</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Flight Statistics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Flight Statistics</CardTitle>
                  <CardDescription>Monthly flight data overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={flightStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="flights" fill="#3b82f6" name="Flights" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Survey Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Survey Types Distribution</CardTitle>
                  <CardDescription>Breakdown by survey category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={surveyTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {surveyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Flight Hours Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Flight Hours Trend</CardTitle>
                  <CardDescription>Monthly flight hours over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={flightStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="hours" stroke="#10b981" strokeWidth={2} name="Hours" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distance Covered */}
              <Card>
                <CardHeader>
                  <CardTitle>Distance Covered</CardTitle>
                  <CardDescription>Total distance flown per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={flightStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="distance" fill="#f59e0b" name="Distance (km)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="surveys" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Survey Reports</CardTitle>
                <CardDescription>Detailed survey summaries and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surveys.map((survey) => (
                    <div key={survey.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(survey.status)}`} />
                          <div>
                            <h3 className="font-medium">{survey.name}</h3>
                            <p className="text-sm text-gray-500">
                              {survey.id} • {survey.drone}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{survey.date}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{survey.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{survey.distance}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Area: </span>
                          <span>{survey.area}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Images: </span>
                          <span>{survey.images}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Data Points Collected: {survey.dataPoints}</span>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            Download Report
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Drone Performance Analysis</CardTitle>
                <CardDescription>Individual drone utilization and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {droneUtilizationData.map((drone) => (
                    <div key={drone.drone} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Drone className="h-5 w-5 text-blue-600" />
                          <h3 className="font-medium">{drone.drone}</h3>
                        </div>
                        <Badge variant="outline">{drone.efficiency}% Efficiency</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Missions: </span>
                          <span className="font-medium">{drone.missions}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Flight Hours: </span>
                          <span className="font-medium">{drone.hours}h</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg per Mission: </span>
                          <span className="font-medium">{(drone.hours / drone.missions).toFixed(1)}h</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
