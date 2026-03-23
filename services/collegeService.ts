export interface College {
    id?: string;
    name: string;
    university?: string;
    state: string;
    district?: string;
    type?: string;
}

let cachedColleges: College[] | null = null;
let fetchPromise: Promise<College[]> | null = null;

export const collegeService = {
    getAll: async (): Promise<College[]> => {
        if (cachedColleges) return cachedColleges;

        if (fetchPromise) return fetchPromise;

        fetchPromise = fetch('/colleges.json')
            .then(res => {
                if (!res.ok) throw new Error("Failed to load colleges");
                return res.json();
            })
            .then(data => {
                cachedColleges = data;
                fetchPromise = null;
                return data;
            })
            .catch(err => {
                console.error("Error loading colleges:", err);
                fetchPromise = null;
                return [];
            });

        return fetchPromise;
    },

    getRandomCollege: async (): Promise<string> => {
        const colleges = await collegeService.getAll();
        if (colleges.length === 0) return "IIT Bombay"; // Fallback
        return colleges[Math.floor(Math.random() * colleges.length)].name;
    },

    searchFallback: async (query: string): Promise<College[]> => {
        try {
            const res = await fetch(`/api/colleges/search?query=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (error) {
            console.error("Fallback search failed:", error);
            return [];
        }
    },

    search: async (query: string): Promise<College[]> => {
        if (!query || query.length < 2) return [];

        try {
            // Run both searches in parallel for better UX
            const [localColleges, fallbackResults] = await Promise.all([
                collegeService.getAll(),
                collegeService.searchFallback(query)
            ]);

            const lowerQ = query.toLowerCase();

            // 1. Local Limits
            const localMatches = localColleges.filter(c =>
                c.name.toLowerCase().includes(lowerQ) ||
                (c.university && c.university.toLowerCase().includes(lowerQ)) ||
                (c.district && c.district.toLowerCase().includes(lowerQ)) ||
                c.state.toLowerCase().includes(lowerQ)
            ).slice(0, 20); // Take top 20 local

            // 2. Merge with Fallback (Deduplicating by name)
            const combined = [...localMatches];
            const names = new Set(localMatches.map(c => c.name.toLowerCase()));

            for (const college of fallbackResults) {
                if (!names.has(college.name.toLowerCase())) {
                    combined.push(college);
                    names.add(college.name.toLowerCase());
                }
            }

            return combined.slice(0, 50); // Return top 50 total

        } catch (error) {
            console.error("Search failed:", error);
            // Fallback to minimal local search if catastrophic failure
            try {
                const all = await collegeService.getAll();
                return all.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
            } catch (e) {
                return [];
            }
        }
    }
};
