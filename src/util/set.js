
class AutopSet extends Phaser.Structs.Set {
    
	intersects(set)  {
		for(let i = 0; i < this.entries.length; i++) {
            if (set.contains(this.entries[i])) return true;
        }
        return false;
    }
	
	containsArray(values) {
		for(let i = 0; i < values.length; i++) {
			if(!this.contains(values[i])) return false;
		}
		return true;
	}
	
    intersect(set)
    {
        var newSet = new AutopSet();

        this.entries.forEach(function (value)
        {
            if (set.contains(value))
            {
                newSet.set(value);
            }
        });

        return newSet;
    }	
	
    union(set)
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
	
    difference(set)
    {
        var newSet = new AutopSet();

        this.entries.forEach(function (value)
        {
            if (!set.contains(value))
            {
                newSet.set(value);
            }
        });

        return newSet;
    }	
	
	shuffle() {
		this.entries = Phaser.Utils.Array.Shuffle(this.entries);
		return this;
	}
	
	random() {
		return Phaser.Math.RND.pick(this.entries);
	}
}

export default AutopSet;