
class AutopSet extends Phaser.Structs.Set {
    
	intersects(set)  {
		for(let i = 0; i < this.entries.length; i++) {
            if (set.contains(entries[i])) return true;
        }
        return false;
    }
	
	containsArray(values) {
		for(let i = 0; i < values.length; i++) {
			if(!this.contains(values[i])) return false;
		}
		return true;
	}
	
    union (set)
    {
        var newSet = new AutopSet();

        set.entries.forEach(function (value)
        {
            newSet.set(value);
        });

        this.entries.forEach(function (value)
        {
            newSet.set(value);
        });

        return newSet;
    }
	
	
}

export default AutopSet;