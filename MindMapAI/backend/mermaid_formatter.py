def to_mermaid(nodes, edges, main_topic=None):
    """
    Convert nodes and edges to structured Mermaid mind map syntax
    that exactly matches the image example style with a single unified structure.
    
    Parameters:
    - nodes: List of node names
    - edges: List of [source, target, relationship] triples
    - main_topic: The original user query to use as the main/root node
    """
    # Ensure edges have the correct format [source, target, relationship]
    # If an edge has only 2 elements, add an empty relationship
    sanitized_edges = []
    for edge in edges:
        if not edge:
            continue
        if len(edge) == 2:
            sanitized_edges.append([edge[0], edge[1], ""])
        elif len(edge) >= 3:
            sanitized_edges.append([edge[0], edge[1], edge[2]])
        else:
            # Skip invalid edges
            continue
    
    # Use sanitized edges from now on
    edges = sanitized_edges
    
    # First, identify the main/root node - either already defined or the one with most connections
    node_connections = {}
    for source, target, _ in edges:
        # Skip any empty nodes
        if not source or not target:
            continue
            
        if source not in node_connections:
            node_connections[source] = 0
        if target not in node_connections:
            node_connections[target] = 0
        node_connections[source] += 1  # Outgoing connection
        node_connections[target] -= 1  # Incoming connection
    
    # Filter out any empty nodes
    nodes = [node for node in nodes if node and node.strip()]
    
    # If main_topic is provided, make it the root node or find a close match
    if main_topic:
        main_topic_lower = main_topic.lower().strip()
        
        # First try to find exact match
        main_node = None
        for node in nodes:
            if node.lower() == main_topic_lower:
                main_node = node
                break
                
        # If no exact match, look for node containing the topic
        if not main_node:
            for node in nodes:
                if main_topic_lower in node.lower() or node.lower() in main_topic_lower:
                    main_node = node
                    break
                    
        # If still no match, use the topic directly
        if not main_node:
            main_node = main_topic
            # Add it to nodes if not already there
            if main_node not in nodes:
                nodes.append(main_node)
    else:
        # Original approach if no main_topic provided
        main_candidates = ["Agentic AI Development Methodologies", "AI Development", "AI Methodologies", 
                          "AI Development Methodologies", "Development Methodologies", "Agentic AI"]
        
        main_node = None
        for candidate in main_candidates:
            if candidate in nodes:
                main_node = candidate
                break
        
        # If no main candidate found, use the one with most outgoing connections
        if not main_node:
            sorted_nodes = sorted(node_connections.items(), key=lambda x: x[1], reverse=True)
            main_node = sorted_nodes[0][0] if sorted_nodes else (nodes[0] if nodes else "Main Topic")
    
    # Force main node to be the central node
    new_edges = []
    used_targets = set()
    
    # First, identify direct children of the main node (main categories)
    main_categories = []
    for source, target, rel in edges:
        # Skip empty nodes
        if not source or not target:
            continue
            
        if source == main_node:
            main_categories.append(target)
            new_edges.append([source, target, rel])
            used_targets.add(target)
    
    # If no main categories directly connected, create artificial main categories
    if not main_categories:
        # Common main categories for AI development
        artificial_categories = [
            "Architectural Approaches", 
            "Learning Paradigms", 
            "Training and Evaluation Techniques", 
            "Tools and Frameworks"
        ]
        
        # Find which of these are in the nodes, or add the most connected ones
        for category in artificial_categories:
            if category in nodes:
                main_categories.append(category)
                new_edges.append([main_node, category, ""])
                used_targets.add(category)
        
        # If still no main categories, use the most connected nodes
        if not main_categories:
            sorted_nodes = sorted(node_connections.items(), key=lambda x: x[1], reverse=True)
            for node, connections in sorted_nodes[:5]:  # Take up to 5 most connected nodes
                if node != main_node and node not in used_targets:
                    main_categories.append(node)
                    new_edges.append([main_node, node, ""])
                    used_targets.add(node)
    
    # Connect remaining nodes to appropriate main categories
    remaining_edges = []
    for source, target, rel in edges:
        # Skip empty nodes
        if not source or not target:
            continue
            
        if source != main_node and target not in used_targets:
            if source in main_categories:
                new_edges.append([source, target, rel])
                used_targets.add(target)
            else:
                remaining_edges.append([source, target, rel])
    
    # Process any remaining edges
    for source, target, rel in remaining_edges:
        # Skip empty nodes
        if not source or not target:
            continue
            
        if target not in used_targets:
            # Find best main category to connect to
            best_category = main_categories[0] if main_categories else main_node  # Default
            for category in main_categories:
                if category in source or source in category:
                    best_category = category
                    break
            
            # Connect to best category if source is not connected
            if source not in used_targets:
                new_edges.append([best_category, source, ""])
                used_targets.add(source)
            
            # Add the original edge
            new_edges.append([source, target, rel])
            used_targets.add(target)
    
    # Make sure all nodes are connected
    for node in nodes:
        # Skip empty nodes
        if not node or not node.strip():
            continue
            
        if node != main_node and node not in used_targets:
            # Connect to most relevant main category
            best_category = main_categories[0] if main_categories else main_node  # Default
            for category in main_categories:
                if category in node or node in category:
                    best_category = category
                    break
            
            new_edges.append([best_category, node, ""])
            used_targets.add(node)
    
    # Helper function to sanitize node IDs
    def sanitize_node_id(text):
        """
        Remove or replace special characters that can cause issues in Mermaid syntax.
        """
        if not text:
            return "empty_node"
            
        # Replace spaces with underscores
        result = text.replace(' ', '_')
        
        # Remove or replace special characters
        result = result.replace('(', '').replace(')', '')
        result = result.replace('[', '').replace(']', '')
        result = result.replace('{', '').replace('}', '')
        result = result.replace('<', '').replace('>', '')
        result = result.replace('/', '_').replace('\\', '_')
        result = result.replace('&', '_and_')
        result = result.replace('-', '_')
        result = result.replace(':', '_')
        result = result.replace('.', '_')
        result = result.replace(',', '_')
        result = result.replace('?', '')
        result = result.replace('!', '')
        result = result.replace("'", '')
        result = result.replace('"', '')
        
        # Ensure valid ID by removing any non-alphanumeric/underscore characters
        # and make sure it starts with a letter or underscore
        result = ''.join(c for c in result if c.isalnum() or c == '_')
        
        # Ensure ID doesn't start with a number
        if result and result[0].isdigit():
            result = 'n_' + result
            
        # If empty after cleaning, use a placeholder
        if not result:
            return "node_" + str(hash(text) % 10000)
        
        return result
    
    # Generate Mermaid code with proper hierarchy
    lines = ["graph LR;"]  # Left-to-right layout
    
    # Add simple configuration for reliable rendering
    lines.append("    %% Configuration")
    
    # Simple styling that matches the image (white rectangles with colored borders)
    lines.append("    %% Styling")
    lines.append("    classDef root fill:white,stroke:#F08BC3,color:#333333,stroke-width:2;")
    lines.append("    classDef mainCategory fill:white,stroke:#6495ED,color:#333333,stroke-width:2;")
    lines.append("    classDef default fill:white,stroke:#A6ABFF,color:#333333,stroke-width:1.5;")
    
    # Skip link styling as it's causing Unicode problems
    # lines.append("    %% Link styling")
    # lines.append("    linkStyle default stroke:#6a3ee8;")
    
    # Add main node with ID
    main_id = sanitize_node_id(main_node)
    lines.append(f"    {main_id}[\"{ main_node}\"];")
    lines.append(f"    class {main_id} root;")
    
    # Track nodes that have been added
    added_nodes = {main_node}
    
    # Process all edges
    for source, target, _ in new_edges:
        # Validate source and target
        if not source or not target:
            continue
            
        source_id = sanitize_node_id(source)
        target_id = sanitize_node_id(target)
        
        # Add source node if not already added
        if source not in added_nodes:
            lines.append(f"    {source_id}[\"{source}\"];")
            added_nodes.add(source)
            
            # Apply styling for main categories
            if source in main_categories:
                lines.append(f"    class {source_id} mainCategory;")
        
        # Add target node if not already added
        if target not in added_nodes:
            lines.append(f"    {target_id}[\"{target}\"];")
            added_nodes.add(target)
        
        # Add the connection with no text (keep lines thin and simple)
        lines.append(f"    {source_id} --> {target_id};")
    
    return "\n".join(lines) 