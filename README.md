# Wrldc_RRAS_Ramp_Correction

The core logic of this algorithm is 

For a particular row solve the following constraints

1. RampedUp > RampSpecified

        RUPFlag = true
        
        Decrease RRASUP by difference provided that value>=0 and follows trend
        
        If the problem persists, increase RRASDN by difference provided that value>=0 and follows trend

2. RampedDown < RampSpecified

        RDNFlag = true
        
        Decrease RRASDN by difference provided that value>=0 and follows trend
        
        If the problem persists, increase RRASUP by difference provided that value>=0 and follows trend

3. NewNetSchedule < Tech Min

        TMFlag = true
        
        Decrease RRASDN by difference provided that value>=0 and follows trend
        
        Not needed to increase RRASUP for this constraint

4. NewNetSchedule > DC

        DCFlag = true
        
        Decrease RRASUP by difference provided that value>=0 and follows trend
        
        Not needed to increase RRASDN for this constraint

***

The document for this code is <a href="https://docs.google.com/document/d/1R9OZba75lMB2HQSCmbxJffTHkQcL62in-628SLHMIKE/edit?usp=sharing">here</a>

The app can be run <a href="https://nagasudhirpulla.github.io/Wrldc_RRAS_Ramp_Correction/bulk-solve/">here</a>
