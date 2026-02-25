import * as XLSX from 'xlsx';

/**
 * Utilitaires pour l'exportation de données
 */

export const ExportUtils = {
    /**
     * Convertit un tableau d'objets en chaîne CSV
     */
    jsonToCsv(data: any[], headers: Record<string, string>): string {
        if (!data || !data.length) return "";

        const keys = Object.keys(headers);
        const headerRow = keys.map(k => `"${headers[k].replace(/"/g, '""')}"`).join(",");

        const rows = data.map(item => {
            return keys.map(k => {
                let val = item[k];
                if (val === undefined || val === null) val = "";

                // Handle arrays (like tags or choices)
                if (Array.isArray(val)) {
                    val = val.join(" | ");
                }

                // Handle dates
                if (k === 'createdAt' || k === 'created_at') {
                    try {
                        val = new Date(val).toLocaleString();
                    } catch (e) {
                        // ignore
                    }
                }

                const stringVal = String(val).replace(/"/g, '""');
                return `"${stringVal}"`;
            }).join(",");
        });

        return [headerRow, ...rows].join("\n");
    },

    /**
     * Convertit un tableau d'objets en fichier Excel (XLSX)
     */
    jsonToExcel(data: any[], headers: Record<string, string>, fileName: string) {
        if (!data || !data.length) return;

        // Map data to use header labels as keys
        const formattedData = data.map(item => {
            const newItem: any = {};
            Object.keys(headers).forEach(key => {
                let val = item[key];

                // Formatting logic similar to CSV
                if (val === undefined || val === null) val = "";
                if (Array.isArray(val)) val = val.join(" | ");
                if (key === 'createdAt' || key === 'created_at') {
                    try { val = new Date(val).toLocaleString(); } catch (e) { }
                }

                newItem[headers[key]] = val;
            });
            return newItem;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Données");

        // Write and download
        XLSX.writeFile(workbook, fileName);
    },

    /**
     * Déclenche le téléchargement du fichier dans le navigateur
     */
    downloadFile(content: string | Blob, fileName: string, mimeType: string = 'text/csv;charset=utf-8;') {
        const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
