import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FRAMEWORKS } from "@/lib/constants";

export function FrameworkSelector() {
  return (
    <Card className="mt-10">
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Productivity Frameworks</CardTitle>
        <p className="mt-1 text-sm text-gray-500">
          Select a framework to help organize your tasks and boost productivity.
        </p>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FRAMEWORKS.map((framework) => (
            <div 
              key={framework.id} 
              className="border border-gray-200 rounded-lg p-5 hover:border-primary-500 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center mb-4">
                <div className={`p-2 rounded-md ${framework.color}`}>
                  <span className="material-icons">{framework.icon}</span>
                </div>
                <h4 className="ml-3 text-lg font-medium text-gray-900">{framework.name}</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">{framework.description}</p>
              <Link href={framework.path} className="text-sm font-medium text-primary-600 hover:text-primary-800">
                Use this framework →
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
