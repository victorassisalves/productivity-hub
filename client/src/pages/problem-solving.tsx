import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { PROBLEM_TECHNIQUES } from "@/lib/constants";
import { Lightbulb, Hammer, CheckCircle2 } from "lucide-react";

export default function ProblemSolvingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("fiveWhys");
  const [problem, setProblem] = useState("");
  const [whys, setWhys] = useState<string[]>(Array(5).fill(""));
  const [rootCause, setRootCause] = useState("");
  const [action, setAction] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const handleWhyChange = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    setWhys(newWhys);
  };
  
  const nextStep = () => {
    if (step === 0 && !problem) {
      toast({
        title: "Please define the problem",
        description: "Describe the problem you're trying to solve before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    if (step < 5) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const resetAnalysis = () => {
    setProblem("");
    setWhys(Array(5).fill(""));
    setRootCause("");
    setAction("");
    setStep(0);
  };
  
  const createTask = () => {
    setLoading(true);
    // Simulate task creation
    setTimeout(() => {
      toast({
        title: "Task created",
        description: "An action task has been added to your to-do list.",
      });
      setLoading(false);
    }, 1000);
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Problem Solving</h2>
            <p className="text-muted-foreground">
              Analyze problems systematically to find root causes and effective solutions.
            </p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="fiveWhys">5 Whys Analysis</TabsTrigger>
            <TabsTrigger value="otherTechniques" disabled>Other Techniques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fiveWhys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>5 Whys Analysis</CardTitle>
                <CardDescription>
                  Identify the root cause of a problem by repeatedly asking "why" until you reach the underlying issue.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      <h3 className="font-semibold">Define the Problem</h3>
                    </div>
                    <Textarea
                      placeholder="Clearly describe the problem you're facing..."
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
                
                {step > 0 && step <= 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {step}
                      </span>
                      <h3 className="font-semibold">
                        Why {step === 1 ? "is this happening?" : "is that the case?"}
                      </h3>
                    </div>
                    
                    {step === 1 && (
                      <div className="pl-9 text-muted-foreground text-sm mb-4">
                        <p>Problem: {problem}</p>
                      </div>
                    )}
                    
                    {step > 1 && (
                      <div className="pl-9 text-muted-foreground text-sm mb-4">
                        <p>Previous answer: {whys[step-2]}</p>
                      </div>
                    )}
                    
                    <Textarea
                      placeholder={`Why ${step === 1 ? problem : whys[step-2]}...`}
                      value={whys[step-1]}
                      onChange={(e) => handleWhyChange(step-1, e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                )}
                
                {step === 6 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <h3 className="font-semibold">Root Cause Identified</h3>
                    </div>
                    <div className="rounded-lg border p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium">Problem</p>
                        <p className="text-muted-foreground">{problem}</p>
                      </div>
                      
                      {whys.map((why, index) => (
                        <div key={index}>
                          <p className="text-sm font-medium">Why #{index+1}</p>
                          <p className="text-muted-foreground">{why || "Not provided"}</p>
                        </div>
                      ))}
                      
                      <div>
                        <p className="text-sm font-medium">Root Cause</p>
                        <Textarea
                          placeholder="Based on your analysis, what is the root cause?"
                          value={rootCause}
                          onChange={(e) => setRootCause(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {step === 7 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Hammer className="h-5 w-5 text-blue-500" />
                      <h3 className="font-semibold">Define Action Plan</h3>
                    </div>
                    <div className="rounded-lg border p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium">Root Cause</p>
                        <p className="text-muted-foreground">{rootCause}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Action Plan</p>
                        <Textarea
                          placeholder="What actions will you take to address the root cause?"
                          value={action}
                          onChange={(e) => setAction(e.target.value)}
                          className="mt-1 min-h-[100px]"
                        />
                      </div>
                      
                      <Button
                        onClick={createTask}
                        disabled={!action.trim() || loading}
                        className="w-full"
                      >
                        {loading ? "Creating Task..." : "Create Task from Action Plan"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={step === 0 ? resetAnalysis : prevStep}
                  disabled={loading}
                >
                  {step === 0 ? "Reset" : "Back"}
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={
                    (step === 0 && !problem) ||
                    (step > 0 && step <= 5 && !whys[step-1]) ||
                    (step === 6 && !rootCause) ||
                    step === 7 ||
                    loading
                  }
                >
                  {step < 5 ? "Next Why" : step === 5 ? "Identify Root Cause" : step === 6 ? "Create Action Plan" : "Finish"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="otherTechniques">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {PROBLEM_TECHNIQUES.filter(technique => technique.id !== "fiveWhys").map((technique) => (
                <Card key={technique.id}>
                  <CardHeader>
                    <CardTitle>{technique.name}</CardTitle>
                    <CardDescription>{technique.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" disabled>
                      Coming Soon
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}