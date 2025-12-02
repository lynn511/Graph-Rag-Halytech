"""import pickle

with open("data/graph.pkl", "rb") as f:
    g = pickle.load(f)

print("Nodes:", len(g.nodes()))
print("Edges:", len(g.edges()))
"""
import json
import pickle

with open("data/graph.pkl", "rb") as f:
    g = pickle.load(f)

data = {
    "nodes": [{"id": n, **g.nodes[n]} for n in g.nodes()],
    "edges": [{"source": u, "target": v, **g.edges[u, v]} for u, v in g.edges()]
}

with open("graph.json", "w") as f:
    json.dump(data, f, indent=2)

print("Saved graph.json")
