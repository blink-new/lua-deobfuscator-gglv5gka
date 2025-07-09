import { useState } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Textarea } from './components/ui/textarea'
import { Badge } from './components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Progress } from './components/ui/progress'
import { Separator } from './components/ui/separator'
import { CheckCircle, Code, Download, Upload, Zap, Shield, Eye, Copy, RefreshCw, FileText, Github } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

// Deobfuscation functions
const deobfuscateCode = (code: string): { deobfuscated: string; techniques: string[] } => {
  let deobfuscated = code
  const techniques: string[] = []

  // Remove excessive whitespace and normalize
  if (code.match(/\s{3,}/)) {
    deobfuscated = deobfuscated.replace(/\s+/g, ' ').trim()
    techniques.push('Whitespace normalization')
  }

  // String concatenation deobfuscation
  if (code.includes('..')) {
    deobfuscated = deobfuscated.replace(/(['"])(.*?)\1\s*\.\.\s*(['"])(.*?)\3/g, '$1$2$4$3')
    techniques.push('String concatenation simplification')
  }

  // Variable name deobfuscation (common obfuscated patterns)
  const obfuscatedVars = deobfuscated.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || []
  const varMap = new Map<string, string>()
  
  obfuscatedVars.forEach((varName, index) => {
    if (varName.length > 10 && varName.match(/^[a-zA-Z_]{1}[a-zA-Z0-9_]{9,}$/)) {
      const newName = `var_${index + 1}`
      varMap.set(varName, newName)
    }
  })

  if (varMap.size > 0) {
    varMap.forEach((newName, oldName) => {
      deobfuscated = deobfuscated.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName)
    })
    techniques.push('Variable name simplification')
  }

  // Function name deobfuscation
  const functionPattern = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g
  let match
  const funcMap = new Map<string, string>()
  let funcIndex = 1

  while ((match = functionPattern.exec(code)) !== null) {
    const funcName = match[1]
    if (funcName.length > 10) {
      funcMap.set(funcName, `func_${funcIndex++}`)
    }
  }

  if (funcMap.size > 0) {
    funcMap.forEach((newName, oldName) => {
      deobfuscated = deobfuscated.replace(new RegExp(`\\b${oldName}\\b`, 'g'), newName)
    })
    techniques.push('Function name simplification')
  }

  // Base64 decoding
  const base64Pattern = /['"]((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)['"]/g
  deobfuscated = deobfuscated.replace(base64Pattern, (match, encoded) => {
    try {
      const decoded = atob(encoded)
      if (decoded.length > 0 && decoded.match(/^[a-zA-Z0-9\s.,!?;:(){}[\]"'-]+$/)) {
        techniques.push('Base64 decoding')
        return `"${decoded}"`
      }
    } catch {
      // Not valid base64, keep original
    }
    return match
  })

  // Hex string decoding
  const hexPattern = /\\x([0-9a-fA-F]{2})/g
  deobfuscated = deobfuscated.replace(hexPattern, (match, hex) => {
    const char = String.fromCharCode(parseInt(hex, 16))
    if (char.match(/[a-zA-Z0-9\s.,!?;:(){}[\]"'-]/)) {
      techniques.push('Hex string decoding')
      return char
    }
    return match
  })

  // Escape sequence normalization
  deobfuscated = deobfuscated.replace(/\\n/g, '\n')
  deobfuscated = deobfuscated.replace(/\\t/g, '\t')
  deobfuscated = deobfuscated.replace(/\\r/g, '\r')
  deobfuscated = deobfuscated.replace(/\\"/g, '"')
  deobfuscated = deobfuscated.replace(/\\'/g, "'")

  // Format the code with proper indentation
  const lines = deobfuscated.split('\n')
  let indentLevel = 0
  const formatted = lines.map(line => {
    const trimmed = line.trim()
    if (trimmed.includes('end') || trimmed.includes('}')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    const result = '  '.repeat(indentLevel) + trimmed
    
    if (trimmed.includes('function') || trimmed.includes('if') || trimmed.includes('for') || 
        trimmed.includes('while') || trimmed.includes('do') || trimmed.includes('{')) {
      indentLevel++
    }
    
    return result
  }).join('\n')

  if (formatted !== deobfuscated) {
    techniques.push('Code formatting')
  }

  return { deobfuscated: formatted, techniques }
}

function App() {
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [techniques, setTechniques] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDeobfuscate = async () => {
    if (!inputCode.trim()) {
      toast.error('Please enter some Lua code to deobfuscate')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    // Simulate processing progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = deobfuscateCode(inputCode)
      setOutputCode(result.deobfuscated)
      setTechniques(result.techniques)
      
      setProgress(100)
      toast.success('Code deobfuscated successfully!')
    } catch (error) {
      toast.error('Error deobfuscating code')
      console.error(error)
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded!')
  }

  const clearAll = () => {
    setInputCode('')
    setOutputCode('')
    setTechniques([])
    toast.success('All cleared!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Lua Deobfuscator
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional tool to deobfuscate and restore readable Lua code. Reverse common obfuscation techniques with advanced pattern recognition.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="gap-1">
              <Shield className="h-3 w-3" />
              Secure
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Fast
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              Readable
            </Badge>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="deobfuscate" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="deobfuscate">Deobfuscator</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="deobfuscate" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Input (Obfuscated Code)
                    </CardTitle>
                    <CardDescription>
                      Paste your obfuscated Lua code here
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      placeholder={`-- Example obfuscated Lua code
local ${'a'.repeat(20)} = "SGVsbG8gV29ybGQ="
local ${'b'.repeat(15)} = function(x) return x..x end
print(${'a'.repeat(20)}..${'b'.repeat(15)}("test"))`}
                      className="min-h-[400px] font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDeobfuscate}
                        disabled={isProcessing || !inputCode.trim()}
                        className="flex-1"
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Deobfuscate
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={clearAll}>
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Output Section */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Output (Deobfuscated Code)
                    </CardTitle>
                    <CardDescription>
                      Clean, readable Lua code
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={outputCode}
                      readOnly
                      placeholder="Deobfuscated code will appear here..."
                      className="min-h-[400px] font-mono text-sm bg-slate-50"
                    />
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => copyToClipboard(outputCode)}
                        disabled={!outputCode}
                        variant="outline"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button 
                        onClick={() => downloadCode(outputCode, 'deobfuscated.lua')}
                        disabled={!outputCode}
                        variant="outline"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar */}
              {isProcessing && (
                <motion.div 
                  className="w-full max-w-md mx-auto"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-2">
                    <span className="text-sm font-medium">Processing... {progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </motion.div>
              )}

              {/* Techniques Used */}
              {techniques.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Techniques Applied
                      </CardTitle>
                      <CardDescription>
                        Deobfuscation methods used on your code
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {techniques.map((technique, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Badge variant="outline" className="p-2 gap-2">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              {technique}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    About Lua Deobfuscator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600">
                    This tool helps reverse-engineer obfuscated Lua code by applying various deobfuscation techniques. 
                    It's designed for security researchers, developers, and anyone who needs to understand obfuscated Lua scripts.
                  </p>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3">Supported Techniques:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Badge variant="outline">String concatenation</Badge>
                        <Badge variant="outline">Variable renaming</Badge>
                        <Badge variant="outline">Function renaming</Badge>
                        <Badge variant="outline">Whitespace normalization</Badge>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline">Base64 decoding</Badge>
                        <Badge variant="outline">Hex string decoding</Badge>
                        <Badge variant="outline">Escape sequences</Badge>
                        <Badge variant="outline">Code formatting</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold mb-3">Features:</h3>
                    <ul className="space-y-2 text-slate-600">
                      <li>• Real-time deobfuscation processing</li>
                      <li>• Pattern recognition for common obfuscation methods</li>
                      <li>• Clean, readable output with proper formatting</li>
                      <li>• Copy and download functionality</li>
                      <li>• Secure client-side processing</li>
                    </ul>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    <span className="text-sm text-slate-600">
                      Built with React, TypeScript, and Tailwind CSS
                    </span>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://github.com/blink-new/lua-deobfuscator-gglv5gka', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    Fork on GitHub
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default App