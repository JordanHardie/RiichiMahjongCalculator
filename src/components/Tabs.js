export function Tabs({ defaultValue, children }) {
    return (
        <div data-orientation="horizontal" data-state="active" className="w-full">
            {children}
        </div>
    );
}

export function TabsList({ children }) {
    return (
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {children}
        </div>
    );
}

export function TabsTrigger({ value, children, ...props }) {
    return (
        <button
            role="tab"
            data-state={props["aria-selected"] ? "active" : ""}
            data-value={value}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            {...props}
        >
            {children}
        </button>
    );
}

export function TabsContent({ value, children }) {
    return (
        <div
            role="tabpanel"
            data-state="active"
            data-value={value}
            className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            {children}
        </div>
    );
}