// Importing necessary modules and types
import { TProcess } from "@/types";
import { Collection } from "discord.js";
import { UUID } from "crypto";
import { client } from "@/globals";

// ProcessTracker class definition
export class ProcessTracker {
    private cache = new Collection<UUID, TProcess>();

    // Method to add a new process to the tracker
    add(process: TProcess) {
        this.cache.set(process.id, process);
    }

    // Method to get the count of processes currently tracked
    count() {
        return this.cache.size;
    }

    // Method to remove a process from the tracker using its ID
    remove(id: UUID) {
        this.cache.delete(id);
    }

    // Method to wait for process completion
    async awaitProcessCompletion() {
        const processCount = this.cache.size - 1;

        if (processCount) {
            client.logger.log(`Waiting for ${processCount} process to end.`);
            await this.awaitProcessesEnding();
        } else {
            client.logger.log(`No active processes, contiuning.`);
        }
    }

    // Private method to await the ending of processes with a polling mechanism
    private async awaitProcessesEnding() {
        while (this.cache.size) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
}
