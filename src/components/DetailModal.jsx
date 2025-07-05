@@ .. @@
           <div className="flex-1">
             <Title level={3} className="mb-2">{data.name}</Title>
             <Text type="secondary" className="text-base block mb-4">
-              {data.description}
+              {data.description || 'No description available'}
             </Text>
             <div className="space-y-2">
               <div className="flex items-center space-x-4">
@@ .. @@
                 <Tag color="purple">Variation: {data.variationName}</Tag>
                 <Text type="secondary" className="ml-2">
                   Part of: {data.parentProductName}
+                </Text>
+              </div>
+            )}
+            {data.isVariant && (
+              <div>
+                <Tag color="blue">Variant: {data.variantName}</Tag>
+                <Text type="secondary" className="ml-2">
+                  Part of: {data.parentProductName}
                 </Text>
               </div>
             )}