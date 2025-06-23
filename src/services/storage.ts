
// File-based storage system using localStorage for demo purposes
// In production, this would connect to a real database

export class FileStorage {
  private getKey(collection: string): string {
    return `trash_cleaner_${collection}`;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getCollection<T>(collection: string): T[] {
    const data = localStorage.getItem(this.getKey(collection));
    return data ? JSON.parse(data) : [];
  }

  saveCollection<T>(collection: string, data: T[]): void {
    localStorage.setItem(this.getKey(collection), JSON.stringify(data));
  }

  create<T extends { id?: string; created?: string }>(collection: string, item: Omit<T, 'id' | 'created'>): T {
    const items = this.getCollection<T>(collection);
    const newItem = {
      ...item,
      id: this.generateId(),
      created: new Date().toISOString(),
    } as T;
    
    items.push(newItem);
    this.saveCollection(collection, items);
    return newItem;
  }

  findById<T extends { id: string }>(collection: string, id: string): T | null {
    const items = this.getCollection<T>(collection);
    return items.find(item => item.id === id) || null;
  }

  findBy<T>(collection: string, predicate: (item: T) => boolean): T[] {
    const items = this.getCollection<T>(collection);
    return items.filter(predicate);
  }

  update<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): T | null {
    const items = this.getCollection<T>(collection);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    this.saveCollection(collection, items);
    return items[index];
  }

  delete<T extends { id: string }>(collection: string, id: string): boolean {
    const items = this.getCollection<T>(collection);
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    items.splice(index, 1);
    this.saveCollection(collection, items);
    return true;
  }
}

export const storage = new FileStorage();
