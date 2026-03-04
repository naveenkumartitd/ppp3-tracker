export const CHAPTERS = [
  { id:1,  part:"I",   title:"Hello, World!",              diff:"easy",   days:"1–3",    topics:"Programs, compilation, linking, environments"              },
  { id:2,  part:"I",   title:"Objects, Types and Values",  diff:"easy",   days:"4–7",    topics:"Variables, types, auto keyword, assignment"                },
  { id:3,  part:"I",   title:"Computation",                diff:"medium", days:"8–12",   topics:"Expressions, statements, functions, vectors"               },
  { id:4,  part:"I",   title:"Errors! ⚠",                 diff:"hard",   days:"13–19",  topics:"Compile errors, runtime errors, exceptions — CRITICAL"     },
  { id:5,  part:"I",   title:"Writing a Program ⚠",       diff:"hard",   days:"20–27",  topics:"Calculator project — grammar to code — CRITICAL"           },
  { id:6,  part:"I",   title:"Completing a Program ⚠",    diff:"hard",   days:"28–33",  topics:"Error handling, cleanup, finishing the calculator"          },
  { id:7,  part:"I",   title:"Technicalities: Functions",  diff:"medium", days:"34–37",  topics:"Scope, declarations, namespaces, modules"                  },
  { id:8,  part:"I",   title:"Technicalities: Classes",    diff:"medium", days:"38–42",  topics:"User types, classes, enumerations, overloading"            },
  { id:9,  part:"II",  title:"I/O Streams",                diff:"medium", days:"43–46",  topics:"File I/O, error handling, string streams"                  },
  { id:10, part:"II",  title:"A Display Model",            diff:"easy",   days:"47–49",  topics:"Graphics, coordinates, simple shapes"                      },
  { id:11, part:"II",  title:"Graphics Classes",           diff:"easy",   days:"50–52",  topics:"Point, Line, Color, Polylines, Text, Images"               },
  { id:12, part:"II",  title:"Class Design",               diff:"medium", days:"53–55",  topics:"Design principles, base and derived classes"               },
  { id:13, part:"II",  title:"Graphing Functions",         diff:"easy",   days:"56–57",  topics:"Graphing data, functions, approximation"                   },
  { id:14, part:"II",  title:"Graphical User Interfaces",  diff:"easy",   days:"58–60",  topics:"Widgets, buttons, events, animation"                      },
  { id:15, part:"III", title:"Vector & Free Store 🔴",     diff:"hard",   days:"61–64",  topics:"Memory, addresses, pointers, destructors — MOST CRITICAL"  },
  { id:16, part:"III", title:"Arrays, Pointers, Refs 🔴",  diff:"hard",   days:"65–67",  topics:"C-style strings, pointer arithmetic, references"           },
  { id:17, part:"III", title:"Essential Operations",       diff:"medium", days:"68–70",  topics:"Copying, moving, initializer lists"                        },
  { id:18, part:"III", title:"Templates & Exceptions ⚠",  diff:"hard",   days:"71–80",  topics:"Generic programming, RAII, resource management"            },
  { id:19, part:"III", title:"Containers & Iterators",     diff:"medium", days:"81–87",  topics:"Linked lists, iterators, text editor project"              },
  { id:20, part:"III", title:"Maps and Sets",              diff:"medium", days:"88–93",  topics:"Associative containers, ranges, performance timing"        },
  { id:21, part:"III", title:"Algorithms",                 diff:"medium", days:"94–100", topics:"Sorting, searching, function objects, numerics"            },
];

export const DIFF_STYLE = {
  easy:   { bg: "rgba(34,197,94,0.10)",  color: "var(--green)" },
  medium: { bg: "rgba(232,160,32,0.10)", color: "var(--gold)"  },
  hard:   { bg: "rgba(239,68,68,0.10)",  color: "var(--red)"   },
};

export const STATUS_STYLE = {
  done:   { bg: "var(--green-gl)", border: "rgba(34,197,94,0.3)",  color: "var(--green)", label: "✅ Done"        },
  active: { bg: "var(--blue-gl)",  border: "rgba(59,130,246,0.3)", color: "var(--blue2)", label: "🔄 In Progress" },
  todo:   { bg: "var(--card2)",    border: "var(--border)",        color: "var(--muted)", label: "⏳ To Do"       },
};

export const PART_COLOR = { I: "var(--blue2)", II: "var(--green)", III: "var(--gold)" };
